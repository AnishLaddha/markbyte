package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/redis/go-redis/v9"
	"github.com/shrijan-swaminathan/markbyte/backend/auth"
	"github.com/shrijan-swaminathan/markbyte/backend/db"
	"github.com/shrijan-swaminathan/markbyte/backend/db/redisdb"
	"github.com/shrijan-swaminathan/markbyte/backend/features/markdown_render"
)

var userDB db.UserDB

func SetUserDB(repo db.UserDB) {
	userDB = repo
}

func HandleFetchBlogPost(w http.ResponseWriter, r *http.Request) {
	username := chi.URLParam(r, "username")
	post := chi.URLParam(r, "post")
	unprocess_post_title := strings.ReplaceAll(post, "_", " ")
	var htmlContent string

	active, err := blogPostDataDB.FetchActiveBlog(r.Context(), username, unprocess_post_title)
	if err != nil {
		http.Error(w, "No such Blog Post exists", http.StatusNotFound)
		return
	}

	endpoint := "/" + username + "/" + post
	//try redis
	cacheHit := false
	if redisdb.RedisActive {
		htmlContent, err = redisdb.GetEndpoint(r.Context(), endpoint)
		if err == nil && htmlContent != "" {
			fmt.Printf("Redis cache hit\n")
			cacheHit = true
		} else if err == redis.Nil || htmlContent == "" {
			fmt.Printf("Redis cache miss\n")
		} else {
			fmt.Printf("Some error with redis get: handlefetchblogpost\n")
		}
	}
	if !cacheHit {
		key := fmt.Sprintf("%s_%s_%s.html", username, post, active)

		cred, err := LoadCredentials()
		if err != nil {
			http.Error(w, "Failed to load credentials", http.StatusInternalServerError)
			return
		}
		htmlContent, err = ReadFilefromS3(r.Context(), key, cred)
		if err != nil {
			http.Error(w, "Failed to read HTML file", http.StatusInternalServerError)
			return
		}
		style, err := userDB.GetUserStyle(r.Context(), username)
		if err != nil {
			style = "default"
		}
		markdown_render.InsertTemplate(&htmlContent, style, username)
	}
	if redisdb.RedisActive && !cacheHit {
		err := redisdb.SetEndpoint(r.Context(), endpoint, &htmlContent)
		if err != nil {
			fmt.Printf("Some error with redis set: handlefetchblogpost")
		}
	}
	err = AnalyticsDataDB.IncrementViews(r.Context(), username, unprocess_post_title, active)
	if err != nil {
		fmt.Printf("Failed to increment views: handlefetchblogpost %v\n", err)
	}

	w.Header().Set("Content-Type", "text/html")
	_, err = w.Write([]byte(htmlContent))
	if err != nil {
		http.Error(w, "Failed to write HTML content", http.StatusInternalServerError)
		return
	}
}

type FetchMDRequest struct {
	Title   string `json:"title"`
	Version string `json:"version"`
}

func HandleFetchMD(w http.ResponseWriter, r *http.Request) {
	username, ok := r.Context().Value(auth.UsernameKey).(string)
	if !ok || username == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	var data FetchMDRequest
	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		http.Error(w, "Failed to decode request", http.StatusBadRequest)
		return
	}

	title := data.Title
	processed_title := strings.ReplaceAll(title, " ", "_")
	version := data.Version
	if title == "" || version == "" {
		fmt.Printf("title %s or version %s is empty", title, version)
		http.Error(w, "Invalid title or version", http.StatusBadRequest)
		return
	}
	cred, err := LoadCredentials()
	if err != nil {
		http.Error(w, "Failed to s3 load credentials", http.StatusInternalServerError)
		return
	}
	mdContent, err := ReadFilefromS3(r.Context(), fmt.Sprintf("%s_%s_%s.md", username, processed_title, version), cred)
	if err != nil {
		http.Error(w, "Failed to read markdown file", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "text/markdown")
	_, err = w.Write([]byte(mdContent))
	if err != nil {
		http.Error(w, "Failed to write markdown content", http.StatusInternalServerError)
		return
	}
}
