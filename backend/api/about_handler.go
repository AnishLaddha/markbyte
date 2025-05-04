package api

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/shrijan-swaminathan/markbyte/backend/auth"
	"github.com/shrijan-swaminathan/markbyte/backend/features/markdown_render"
)

type AboutUploadResponse struct {
	MarkdownURL string `json:"markdown_url"`
	HTMLURL     string `json:"html_url"`
}

func HandleAboutPageUpload(w http.ResponseWriter, r *http.Request) {
	// Handle the upload of the about page
	username, ok := r.Context().Value(auth.UsernameKey).(string)
	if !ok || username == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	about_file, _, err := r.FormFile("about_file")
	if err != nil {
		http.Error(w, "Error getting file", http.StatusBadRequest)
		return
	}
	defer about_file.Close()
	err = r.ParseMultipartForm(5 << 20)
	if err != nil {
		http.Error(w, "Error parsing form", http.StatusBadRequest)
		return
	}

	md_content, err := io.ReadAll(about_file)
	if err != nil {
		http.Error(w, "Error reading file", http.StatusBadRequest)
		return
	}

	html_content, err := markdown_render.ConvertMarkdown(md_content)
	if err != nil {
		http.Error(w, "Failed to convert markdown", http.StatusInternalServerError)
		return
	}

	about_filname_md := username + "_about_file.md"
	about_filename_html := username + "_about_file.html"
	cred, err := LoadCredentials()
	if err != nil {
		http.Error(w, "Error loading credentials", http.StatusInternalServerError)
		return
	}

	html_url, err := UploadHTMLFile(r.Context(), html_content, about_filename_html, cred)
	if err != nil {
		http.Error(w, "Error uploading HTML file", http.StatusInternalServerError)
		return
	}

	md_url, err := UploadMDFile(r.Context(), string(md_content), about_filname_md, cred)
	if err != nil {
		http.Error(w, "Error uploading MD file", http.StatusInternalServerError)
		return
	}

	response := AboutUploadResponse{
		MarkdownURL: md_url,
		HTMLURL:     html_url,
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, "Error encoding response", http.StatusInternalServerError)
		return
	}
}

type AboutPageRequest struct {
	Username string `json:"username"`
}

func HandleAboutPageGet(w http.ResponseWriter, r *http.Request) {
	var req AboutPageRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}
	// Handle the request to get the about page
	username := req.Username
	if username == "" {
		http.Error(w, "Username is required", http.StatusBadRequest)
		return
	}
	cred, err := LoadCredentials()
	if err != nil {
		http.Error(w, "Error loading credentials", http.StatusInternalServerError)
		return
	}

	about_page_key := fmt.Sprintf("%s_about_file.html", username)
	html_content, err := ReadFilefromS3(r.Context(), about_page_key, cred)
	if err != nil {
		http.Error(w, "Error reading file from S3", http.StatusInternalServerError)
		return
	}
	user_details, err := userDB.GetUser(r.Context(), username)
	if err != nil {
		http.Error(w, "Failed to get user details", http.StatusInternalServerError)
		return
	}
	if user_details == nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}
	if user_details.Name == "" {
		user_details.Name = username
	}
	if user_details.Style == "" {
		user_details.Style = "default"
	}
	style := user_details.Style
	markdown_render.InsertTemplate(&html_content, style, username, user_details.Name, "")

	w.Header().Set("Content-Type", "text/html")
	w.WriteHeader(http.StatusOK)
	if _, err := w.Write([]byte(html_content)); err != nil {
		http.Error(w, "Error writing response", http.StatusInternalServerError)
		return
	}

}
