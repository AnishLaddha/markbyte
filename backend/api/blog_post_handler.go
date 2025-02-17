package api

import (
	"fmt"
	"net/http"

	"github.com/go-chi/chi/v5"
)

func HandleFetchBlogPost(w http.ResponseWriter, r *http.Request) {
	username := chi.URLParam(r, "username")
	post := chi.URLParam(r, "post")
	blogs, err := blogPostDataDB.FetchAllPostVersions(r.Context(), username, post)
	if err != nil {
		http.Error(w, "No such Blog Post exists", http.StatusNotFound)
		return
	}
	active := blogs.ActiveVersion

	key := fmt.Sprintf("%s_%s_%s.html", username, post, active)

	cred, err := LoadCredentials()
	if err != nil {
		http.Error(w, "Failed to load credentials", http.StatusInternalServerError)
		return
	}
	htmlContent, err := ReadHTMLFile(r.Context(), key, cred)
	if err != nil {
		http.Error(w, "Failed to read HTML file", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "text/html")
	_, err = w.Write([]byte(htmlContent))
	if err != nil {
		http.Error(w, "Failed to write HTML content", http.StatusInternalServerError)
		return
	}
}
