package api

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/shrijan-swaminathan/markbyte/backend/auth"
	"github.com/shrijan-swaminathan/markbyte/backend/db"
	"github.com/shrijan-swaminathan/markbyte/backend/db/redisdb"
	"github.com/shrijan-swaminathan/markbyte/backend/features/markdown_render"
)

type GithubHandlerRequest struct {
	Owner    string `json:"owner"`
	RepoName string `json:"repo_name"`
	Branch   string `json:"branch"`
}

type TreeResponse struct {
	Tree []struct {
		Path string `json:"path"`
		Type string `json:"type"`
		URL  string `json:"url"`
	} `json:"tree"`
}

type BlobResponse struct {
	Content  string `json:"content"`
	Encoding string `json:"encoding"`
}

var githubToken string

// func to set the github token from .env
func SetGithubToken(token string) {
	githubToken = token
}

func HandleGithubUpload(w http.ResponseWriter, r *http.Request) {
	username, ok := r.Context().Value(auth.UsernameKey).(string)
	if !ok || username == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Parse the request body
	var request GithubHandlerRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		return
	}
	//validate the request
	if request.Owner == "" || request.RepoName == "" || request.Branch == "" {
		http.Error(w, "Missing required fields", http.StatusBadRequest)
		return
	}

	// make the github request
	url := fmt.Sprintf("https://api.github.com/repos/%s/%s/git/trees/%s?recursive=1", request.Owner, request.RepoName, request.Branch)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		http.Error(w, "Failed to create request", http.StatusInternalServerError)
		return
	}
	req.Header.Set("User-Agent", "markbyte")
	req.Header.Set("Accept", "application/vnd.github.v3+json")
	if githubToken != "" {
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", githubToken))
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		http.Error(w, "Failed to make GH request", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		http.Error(w, "Failed to get GH response", http.StatusInternalServerError)
		return
	}

	//parse data
	var tree TreeResponse
	if err := json.NewDecoder(resp.Body).Decode(&tree); err != nil {
		http.Error(w, "Failed to parse GH response", http.StatusInternalServerError)
		return
	}
	if len(tree.Tree) == 0 {
		http.Error(w, "No files found in the repository", http.StatusNotFound)
		return
	}

	mdFiles := []map[string]string{}
	for _, file := range tree.Tree {
		if file.Type == "blob" && file.Path[len(file.Path)-3:] == ".md" {
			mdFiles = append(mdFiles, map[string]string{
				"path": file.Path,
				"url":  file.URL,
			})
		}
	}

	for _, file := range mdFiles {
		url = file["url"]
		req, err = http.NewRequest("GET", url, nil)
		if err != nil {
			http.Error(w, "Could not get File Content", http.StatusInternalServerError)
			return
		}

		req.Header.Set("User-Agent", "markbyte")
		req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", githubToken))
		req.Header.Set("Accept", "application/vnd.github.v3+json")

		resp, err = http.DefaultClient.Do(req)
		if err != nil {
			http.Error(w, "Could not get File Content", http.StatusInternalServerError)
			return
		}
		defer resp.Body.Close()
		var blob BlobResponse
		if err := json.NewDecoder(resp.Body).Decode(&blob); err != nil {
			http.Error(w, "Failed to parse GH response", http.StatusInternalServerError)
			return
		}

		decodedContent, err := base64.StdEncoding.DecodeString(strings.ReplaceAll(blob.Content, "\n", ""))
		if err != nil {
			http.Error(w, "Failed to decode file content", http.StatusInternalServerError)
			return
		}

		file["md_content"] = string(decodedContent)
		file["path"] = strings.ReplaceAll(file["path"], "_", "-")
		file["path"] = file["path"][:len(file["path"])-3]
		file["title"] = "docs " + strings.ReplaceAll(file["path"], "/", " ")
	}

	for _, file := range mdFiles {
		html_content, err := markdown_render.ConvertMarkdown([]byte(file["md_content"]))
		if err != nil {
			http.Error(w, "Failed to convert markdown", http.StatusInternalServerError)
			return
		}
		file["html_content"] = html_content
		//file["html_file_name"] = username + "_" + strings.ReplaceAll(file["path"], " ", "_") + ".html"
		//file["md_file_name"] = username + "_" + strings.ReplaceAll(file["path"], " ", "_") + ".md"
		newVersion := 1
		existingPosts, err := blogPostDataDB.FetchAllPostVersions(r.Context(), username, file["title"])
		if err != nil {
			http.Error(w, "Failed to fetch existing posts", http.StatusInternalServerError)
			return
		}
		existingPostsVersions := existingPosts.Versions
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
				err = blogPostDataDB.UpdateActiveStatus(r.Context(), username, file["title"], post.Version, false)
				if err != nil {
					http.Error(w, "Failed to deactivate prev post", http.StatusInternalServerError)
					return
				}
			}
		}
		//WEIRD SHIT HERE
		file["html_file_name"] = username + "_" + strings.ReplaceAll(file["title"], " ", "_") + "_" + fmt.Sprintf("%d", newVersion) + ".html"
		file["md_file_name"] = username + "_" + strings.ReplaceAll(file["title"], " ", "_") + "_" + fmt.Sprintf("%d", newVersion) + ".md"
		file["file_name"] = "docs_" + strings.ReplaceAll(file["path"], "/", "_")

		var url string
		cred, err := LoadCredentials()
		if err != nil {
			fmt.Println("AWS CREDENTIALS NOT SET UP")
		}
		if err == nil {
			s3URL, err := UploadHTMLFile(r.Context(), file["html_content"], file["html_file_name"], cred)
			if err != nil {
				http.Error(w, "Failed to upload html file to s3", http.StatusInternalServerError)
				fmt.Println(err)
				return
			}

			_, err = UploadMDFile(r.Context(), file["md_content"], file["md_file_name"], cred)
			if err != nil {
				http.Error(w, "Failed to upload md file to s3", http.StatusInternalServerError)
				fmt.Println(err)
				return
			}

			url = s3URL
		}
		endpoint := "/" + username + "/" + file["file_name"]
		post_time := time.Now()
		newBlogPostData := db.BlogPostData{
			User:         username,
			Title:        file["title"],
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
			Username:  username,
			Title:     file["title"],
			Version:   fmt.Sprintf("%d", newVersion),
			Date:      post_time,
			Views:     []time.Time{},
			ViewCount: 0,
			Likes:     []string{},
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

	}

	w.WriteHeader(http.StatusOK)
}
