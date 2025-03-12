package markdown_render

import (
	"encoding/json"
	"net/http"

	"github.com/shrijan-swaminathan/markbyte/backend/auth"
)

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

	w.Header().Set("Content-Type", "text/html")
	w.Write([]byte(output_html))
}
