package api

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/shrijan-swaminathan/markbyte/backend/auth"
	"github.com/shrijan-swaminathan/markbyte/backend/db"
	"github.com/shrijan-swaminathan/markbyte/backend/db/redisdb"
	"github.com/shrijan-swaminathan/markbyte/backend/features/markdown_render"
)

const StaticDir = "cmd/static"

// handles upload + conv process
func HandleUpload(w http.ResponseWriter, r *http.Request) {
	// file parse from header

	username, ok := r.Context().Value(auth.UsernameKey).(string)
	if !ok || username == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Failed to read file", http.StatusBadRequest)
		return
	}
	defer file.Close()
	//5 mb limit
	err = r.ParseMultipartForm(5 << 20)
	if err != nil {
		http.Error(w, "Failed to parse form", http.StatusBadRequest)
		return
	}

	title := r.FormValue("title")
	//check for special characters in title
	if strings.ContainsAny(title, `\/:*?"<>|_`) {
		http.Error(w, "Title contains invalid characters", http.StatusBadRequest)
		return
	}

	// read md file
	mdContent, err := io.ReadAll(file)
	if err != nil {
		http.Error(w, "Failed to read uploaded file", http.StatusInternalServerError)
		return
	}

	// md -> html, from features/markdown_render/converter.go
	htmlContent, err := markdown_render.ConvertMarkdown(mdContent)
	if err != nil {
		http.Error(w, "Failed to convert markdown", http.StatusInternalServerError)
		return
	}

	// create static dir if not there
	err = os.MkdirAll(StaticDir, os.ModePerm)
	if err != nil {
		http.Error(w, "Failed to create static directory", http.StatusInternalServerError)
		return
	}

	// save html file
	baseFilename := strings.TrimSuffix(header.Filename, ".md")
	outputFilename := fmt.Sprintf("%s.html", baseFilename)
	outputPath := filepath.Join(StaticDir, outputFilename)

	//check if title is empty/not present
	if title == "" {
		title = baseFilename
	}

	err = os.WriteFile(outputPath, []byte(htmlContent), 0644)
	if err != nil {
		http.Error(w, "Failed to save HTML file", http.StatusInternalServerError)
		return
	}

	existingPosts, err := blogPostDataDB.FetchAllPostVersions(r.Context(), username, title)
	existingPostsVersions := existingPosts.Versions
	if err != nil {
		http.Error(w, "Failed to fetch existing blog posts", http.StatusInternalServerError)
		return
	}

	newVersion := 1
	for _, post := range existingPostsVersions {
		verNum := 1
		_, err := fmt.Sscanf(post.Version, "%d", &verNum)
		if err != nil {
			http.Error(w, "Failed to parse version number", http.StatusInternalServerError)
			return
		}

		if verNum >= newVersion {
			newVersion = verNum + 1
		}
		if post.IsActive {
			err = blogPostDataDB.UpdateActiveStatus(r.Context(), username, baseFilename, post.Version, false)
			if err != nil {
				http.Error(w, "Failed to deactivate prev post", http.StatusInternalServerError)
				return
			}
		}
	}
	//replace space's in filename with underscores
	processed_title := strings.ReplaceAll(title, " ", "_")

	url := fmt.Sprintf("/static/%s", outputFilename)

	keyname := fmt.Sprintf("%s_%s_%d.html", username, processed_title, newVersion)
	md_keyname := fmt.Sprintf("%s_%s_%d.md", username, processed_title, newVersion)

	fmt.Println("Keyname: ", keyname)
	fmt.Println("MD Keyname: ", md_keyname)
	cred, err := LoadCredentials()
	if err != nil {
		fmt.Println("AWS CREDENTIALS NOT SET UP")
	}
	if err == nil {
		s3URL, err := UploadHTMLFile(r.Context(), htmlContent, keyname, cred)
		if err != nil {
			http.Error(w, "Failed to upload html file to s3", http.StatusInternalServerError)
			fmt.Println(err)
			return
		}

		_, err = UploadMDFile(r.Context(), string(mdContent), md_keyname, cred)
		if err != nil {
			http.Error(w, "Failed to upload md file to s3", http.StatusInternalServerError)
			fmt.Println(err)
			return
		}

		url = s3URL
	}

	endpoint := "/" + username + "/" + processed_title

	post_time := time.Now()

	newBlogPostData := db.BlogPostData{
		User:         username,
		Title:        title,
		DateUploaded: post_time,
		Version:      fmt.Sprintf("%d", newVersion),
		IsActive:     true,
		Link:         &url,
		DirectLink:   &endpoint,
	}
	_, err = blogPostDataDB.CreateBlogPost(r.Context(), &newBlogPostData)
	if err != nil {
		http.Error(w, "Failed to save blog post data", http.StatusInternalServerError)
		return
	}

	newPostAnalytics := db.PostAnalytics{
		Username: username,
		Title:    title,
		Version:  fmt.Sprintf("%d", newVersion),
		Date:     post_time,
		Views:    []time.Time{},
		Likes:    []string{},
	}

	_, err = AnalyticsDataDB.CreatePostAnalytics(r.Context(), &newPostAnalytics)
	if err != nil {
		http.Error(w, "Failed to save post analytics data", http.StatusInternalServerError)
		return
	}

	if redisdb.RedisActive {
		err = redisdb.DeleteEndpoint(r.Context(), endpoint)
		if err != nil {
			fmt.Printf("Error removing old endpoint from redis")
		}
	}

	// header + response
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, `{"message": "File processed successfully", "localURL": "/static/%s", "s3URL": "%s"}`, outputFilename, url)
}

type DeleteRequest struct {
	Title string `json:"title"`
}

func HandleDelete(w http.ResponseWriter, r *http.Request) {
	username, ok := r.Context().Value(auth.UsernameKey).(string)
	if !ok || username == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req DeleteRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Failed to decode request", http.StatusBadRequest)
		return
	}

	postVersions, err := blogPostDataDB.FetchAllPostVersions(r.Context(), username, req.Title)
	if err != nil {
		http.Error(w, "Failed to fetch post versions", http.StatusInternalServerError)
		return
	}

	versions := make([]string, len(postVersions.Versions))

	for index, post := range postVersions.Versions {
		versions[index] = post.Version
	}

	_, err = blogPostDataDB.DeleteBlogPost(r.Context(), username, req.Title)
	if err != nil {
		http.Error(w, "Failed to delete blog post", http.StatusInternalServerError)
		return
	}

	_, err = AnalyticsDataDB.DeletePostAnalytics(r.Context(), username, req.Title)
	if err != nil {
		http.Error(w, "Failed to delete post analytics", http.StatusInternalServerError)
		return
	}

	cred, err := LoadCredentials()
	if err != nil {
		fmt.Println("AWS CREDENTIALS NOT SET UP")
		http.Error(w, "Failed to load AWS credentials", http.StatusInternalServerError)
		return
	}

	processed_title := strings.ReplaceAll(req.Title, " ", "_")

	for _, version := range versions {
		html_keyname := fmt.Sprintf("%s_%s_%s.html", username, processed_title, version)
		md_keyname := fmt.Sprintf("%s_%s_%s.md", username, processed_title, version)
		err = DeleteFile(r.Context(), html_keyname, cred)
		if err != nil {
			http.Error(w, "Failed to delete html file", http.StatusInternalServerError)
			return
		}
		err = DeleteFile(r.Context(), md_keyname, cred)
		if err != nil {
			http.Error(w, "Failed to delete md file", http.StatusInternalServerError)
			return
		}
	}

	endpoint := "/" + username + "/" + processed_title
	if redisdb.RedisActive {
		err = redisdb.DeleteEndpoint(r.Context(), endpoint)
		if err != nil {
			fmt.Printf("Error removing old endpoint from redis")
		}
	}

	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, `{"message": "Post deleted successfully"}`)
}
