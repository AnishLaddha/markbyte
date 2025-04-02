package api

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"path/filepath"
	"strings"

	"github.com/shrijan-swaminathan/markbyte/backend/auth"
)

type UpdateUserProfilePictureResponse struct {
	URL string `json:"url"`
}

func HandleUpdateUserProfilePicture(w http.ResponseWriter, r *http.Request) {
	username, ok := r.Context().Value(auth.UsernameKey).(string)
	if !ok || username == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Parse multipart form with 5MB max memory
	if err := r.ParseMultipartForm(5 << 20); err != nil {
		http.Error(w, "Failed to parse form", http.StatusBadRequest)
		return
	}

	file, handler, err := r.FormFile("profile_picture")
	if err != nil {
		http.Error(w, "Failed to get file from form", http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Validate file type
	ext := strings.ToLower(filepath.Ext(handler.Filename))
	if ext != ".jpg" && ext != ".jpeg" && ext != ".png" {
		http.Error(w, "Only JPG and PNG files are allowed", http.StatusBadRequest)
		return
	}

	// Read file content
	fileBytes, err := io.ReadAll(file)
	if err != nil {
		http.Error(w, "Failed to read file", http.StatusInternalServerError)
		return
	}

	// Generate unique filename
	filename := fmt.Sprintf("profile_pictures/%s%s", username, ext)
	images := map[string][]byte{filename: fileBytes}

	// Upload to S3
	s3Creds, err := LoadCredentials()
	if err != nil {
		http.Error(w, "Failed to load s3 credentials", http.StatusInternalServerError)
		return
	}
	urls, err := UploadImages(r.Context(), images, s3Creds)
	if err != nil {
		http.Error(w, "Failed to upload image", http.StatusInternalServerError)
		return
	}

	// Update user's profile picture URL in database
	err = userDB.UpdateUserProfilePicture(r.Context(), username, urls[filename])
	if err != nil {
		http.Error(w, "Failed to update user profile picture", http.StatusInternalServerError)
		return
	}

	// Return the URL in response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(UpdateUserProfilePictureResponse{
		URL: urls[filename],
	})
}
