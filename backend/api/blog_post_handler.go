package api

import (
	"fmt"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/redis/go-redis/v9"
	"github.com/shrijan-swaminathan/markbyte/backend/db/redisdb"
)

func HandleFetchBlogPost(w http.ResponseWriter, r *http.Request) {
	username := chi.URLParam(r, "username")
	post := chi.URLParam(r, "post")
	blogs, err := blogPostDataDB.FetchAllPostVersions(r.Context(), username, post)
	if err != nil {
		http.Error(w, "No such Blog Post exists", http.StatusNotFound)
		return
	}
	var htmlContent string
	endpoint := "/" + username + "/" + post
	//try redis
	if redisdb.RedisActive {
		htmlContent, err = redisdb.GetEndpoint(r.Context(), endpoint)
		if err == nil && htmlContent != "" {
			fmt.Printf("Cache hit\n")
			w.Header().Set("Content-Type", "text/html")
			_, err = w.Write([]byte(htmlContent))
			if err != nil {
				http.Error(w, "Failed to write HTML content", http.StatusInternalServerError)
				return
			}
			return
		} else if err == redis.Nil || htmlContent == "" {
			fmt.Printf("Redis cache miss\n")
		} else {
			fmt.Printf("Some error with redis get: handlefetchblogpost\n")
		}
	}

	active := blogs.ActiveVersion

	key := fmt.Sprintf("%s_%s_%s.html", username, post, active)

	cred, err := LoadCredentials()
	if err != nil {
		http.Error(w, "Failed to load credentials", http.StatusInternalServerError)
		return
	}
	htmlContent, err = ReadHTMLfromS3(r.Context(), key, cred)
	if err != nil {
		http.Error(w, "Failed to read HTML file", http.StatusInternalServerError)
		return
	}

	if redisdb.RedisActive {
		err = redisdb.SetEndpoint(r.Context(), endpoint, &htmlContent)
		if err != nil {
			fmt.Printf("Some error with redis set: handlefetchblogpost")
		}
	}

	w.Header().Set("Content-Type", "text/html")
	_, err = w.Write([]byte(htmlContent))
	if err != nil {
		http.Error(w, "Failed to write HTML content", http.StatusInternalServerError)
		return
	}
}
