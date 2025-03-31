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
	style, err := userDB.GetUserStyle(r.Context(), username)
	if err != nil {
		style = "default"
	}
	InsertTemplate(&output_html, style)
	w.Header().Set("Content-Type", "text/html")
	_, err = w.Write([]byte(output_html))
	if err != nil {
		http.Error(w, "Failed to write HTML content", http.StatusInternalServerError)
		return
	}
}

func InsertTemplate(output_html *string, template_name string) {
	if template_name == "old" {
		*output_html = strings.ReplaceAll(old_template, "{{CONTENT}}", *output_html)
		fmt.Println("old template")
	} else {
		*output_html = strings.ReplaceAll(default_template, "{{CONTENT}}", *output_html)
		fmt.Println("default template")
	}
}
