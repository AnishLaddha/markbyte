package api

import (
	"archive/zip"
	"bytes"
	"context"
	"fmt"
	"io"
	"net/http"
	"path/filepath"
	"strings"
	"time"

	"github.com/shrijan-swaminathan/markbyte/backend/auth"
	"github.com/shrijan-swaminathan/markbyte/backend/db"
	"github.com/shrijan-swaminathan/markbyte/backend/db/redisdb"
	"github.com/shrijan-swaminathan/markbyte/backend/features/markdown_render"
)

type ZipData struct {
	md_content   []byte
	html_content string
	image_urls   []string
	post_name    string
}

func HandleZipUpload(w http.ResponseWriter, r *http.Request) {
	// file parse from header
	username, ok := r.Context().Value(auth.UsernameKey).(string)
	if !ok || username == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	err := r.ParseMultipartForm(20 << 20) // 20 MB
	if err != nil {
		http.Error(w, "Failed to parse form, size issue", http.StatusBadRequest)
		return
	}

	file, _, err := r.FormFile("zipfile")
	if err != nil {
		http.Error(w, "Failed to read file", http.StatusBadRequest)
		return
	}
	defer file.Close()
	buf := new(bytes.Buffer)
	_, err = io.Copy(buf, file)
	if err != nil {
		http.Error(w, "Failed to read ZIP", http.StatusInternalServerError)
		return
	}

	cred, s3err := LoadCredentials()
	if s3err != nil {
		fmt.Println("AWS CREDENTIALS NOT SET UP")
	}

	zip_file_data, err := extractZip(r.Context(), buf.Bytes(), cred, username)
	if err != nil {
		http.Error(w, "Failed to extract zip", http.StatusInternalServerError)
		return
	}

	existingPosts, err := blogPostDataDB.FetchAllPostVersions(r.Context(), username, zip_file_data.post_name)
	existingPostsVersions := existingPosts.Versions
	if err != nil {
		http.Error(w, "Failed to fetch existing blog posts", http.StatusInternalServerError)
		return
	}
	new_version := 1
	for _, post := range existingPostsVersions {
		verNum := 1
		_, err := fmt.Sscanf(post.Version, "%d", &verNum)
		if err != nil {
			http.Error(w, "Failed to parse existing version", http.StatusInternalServerError)
			return
		}
		if verNum >= new_version {
			new_version = verNum + 1
		}
		if post.IsActive {
			err = blogPostDataDB.UpdateActiveStatus(r.Context(), username, zip_file_data.post_name, post.Version, false)
			if err != nil {
				http.Error(w, "Failed to deactivate prev post", http.StatusInternalServerError)
				return
			}
		}
	}

	var url string

	html_keyname := fmt.Sprintf("%s_%s_%d.html", username, zip_file_data.post_name, new_version)
	md_keyname := fmt.Sprintf("%s_%s_%d.md", username, zip_file_data.post_name, new_version)

	if s3err == nil {
		s3URL, err := UploadHTMLFile(r.Context(), zip_file_data.html_content, html_keyname, cred)
		if err != nil {
			http.Error(w, "Failed to upload html file to s3", http.StatusInternalServerError)
			fmt.Println(err)
			return
		}

		_, err = UploadMDFile(r.Context(), string(zip_file_data.md_content), md_keyname, cred)
		if err != nil {
			http.Error(w, "Failed to upload md file to s3", http.StatusInternalServerError)
			fmt.Println(err)
			return
		}

		url = s3URL
	}

	endpoint := "/" + username + "/" + zip_file_data.post_name
	post_time := time.Now()

	new_post := db.BlogPostData{
		User:         username,
		Title:        zip_file_data.post_name,
		DateUploaded: post_time,
		Version:      fmt.Sprintf("%d", new_version),
		IsActive:     true,
		Link:         &url,
		DirectLink:   &endpoint,
	}

	_, err = blogPostDataDB.CreateBlogPost(r.Context(), &new_post)
	if err != nil {
		http.Error(w, "Failed to create blog post", http.StatusInternalServerError)
		return
	}

	newPostAnalytics := db.PostAnalytics{
		Username: username,
		Title:    zip_file_data.post_name,
		Version:  fmt.Sprintf("%d", new_version),
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

	w.WriteHeader(http.StatusOK)

}

func extractZip(ctx context.Context, zipBytes []byte, cred S3Credentials, username string) (ZipData, error) {
	zipReader, err := zip.NewReader(bytes.NewReader(zipBytes), int64(len(zipBytes)))
	if err != nil {
		return ZipData{}, err
	}

	var md_name string
	var md_content []byte

	attachments := make(map[string][]byte)
	for _, file := range zipReader.File {
		if file.FileInfo().IsDir() {
			continue
		}
		fname := filepath.Base(file.Name)
		fileReader, err := file.Open()
		if err != nil {
			return ZipData{}, err
		}

		buf := new(bytes.Buffer)
		_, err = io.Copy(buf, fileReader)
		if err != nil {
			return ZipData{}, err
		}
		fileReader.Close()
		ext := strings.ToLower(filepath.Ext(fname))

		if ext == ".md" && md_name == "" {
			md_name = fname
			md_content = buf.Bytes()
		} else if ext == ".md" {
			return ZipData{}, fmt.Errorf("multiple markdown files found")
		} else {
			fname = fmt.Sprintf("%s_%s", username, fname)
			attachments[fname] = buf.Bytes()
		}
	}
	if md_name == "" {
		return ZipData{}, fmt.Errorf("no markdown file found")
	}

	image_urls, err := UploadImages(ctx, attachments, cred)
	if err != nil {
		return ZipData{}, err
	}

	image_url_list := make([]string, 0)
	for _, value := range image_urls {
		image_url_list = append(image_url_list, value)
	}

	for key, value := range image_urls {
		filename := key[strings.Index(key, "_")+1:]
		md_content = bytes.ReplaceAll(md_content, []byte(filename), []byte(value))
	}

	htmlContent, err := markdown_render.ConvertMarkdown(md_content)
	if err != nil {
		return ZipData{}, err
	}

	postname := strings.TrimSuffix(md_name, ".md")

	return ZipData{
		md_content:   md_content,
		html_content: htmlContent,
		image_urls:   image_url_list,
		post_name:    postname,
	}, nil
}
