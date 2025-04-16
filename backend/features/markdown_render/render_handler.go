package markdown_render

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/shrijan-swaminathan/markbyte/backend/auth"
	"github.com/shrijan-swaminathan/markbyte/backend/db"
)

var userDB db.UserDB

func SetUserDB(repo db.UserDB) {
	userDB = repo
}

type RenderRequest struct {
	MarkdownContent string `json:"markdown_content"`
}

func HandleRender(w http.ResponseWriter, r *http.Request) {
	username, ok := r.Context().Value(auth.UsernameKey).(string)
	if !ok || username == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	var req RenderRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Failed to decode request", http.StatusBadRequest)
		return
	}
	markdown_content := req.MarkdownContent
	output_html, err := ConvertMarkdown([]byte(markdown_content))
	if err != nil {
		http.Error(w, "Failed to convert markdown", http.StatusInternalServerError)
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
	InsertTemplate(&output_html, style, username, user_details.Name)
	w.Header().Set("Content-Type", "text/html")
	_, err = w.Write([]byte(output_html))
	if err != nil {
		http.Error(w, "Failed to write HTML content", http.StatusInternalServerError)
		return
	}
}

func InsertTemplate(output_html *string, template_name string, username string, name string) {
	if template_name == "old" {
		*output_html = strings.ReplaceAll(old_template, "{{CONTENT}}", *output_html)
		fmt.Println("old template")
	} else if template_name == "futuristic" {
		*output_html = strings.ReplaceAll(futuristic_template, "{{CONTENT}}", *output_html)
		*output_html = strings.ReplaceAll(*output_html, "{{USERNAME}}", username)
		fmt.Println("futuristic template")
	} else if template_name == "pink" {
		*output_html = strings.ReplaceAll(pink_template, "{{CONTENT}}", *output_html)
		*output_html = strings.ReplaceAll(*output_html, "{{BLOG_LINK}}", "https://markbyte.xyz/"+username)
		*output_html = strings.ReplaceAll(*output_html, "{{NAME}}", name)
		fmt.Println("pink template")
	} else {
		*output_html = strings.ReplaceAll(default_template, "{{CONTENT}}", *output_html)
		fmt.Println("default template")
	}
}
