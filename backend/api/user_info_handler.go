package api

import (
	"encoding/json"
	"net/http"

	"github.com/shrijan-swaminathan/markbyte/backend/auth"
)

type UserInfoResponse struct {
	Username       string `json:"username"`
	Email          string `json:"email"`
	Style          string `json:"style"`
	ProfilePicture string `json:"profile_picture"`
	Name           string `json:"name"`
}

func HandleUserInfo(w http.ResponseWriter, r *http.Request) {
	username, ok := r.Context().Value(auth.UsernameKey).(string)
	if !ok || username == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	user, err := userDB.GetUser(r.Context(), username)
	if err != nil {
		http.Error(w, "Failed to get user", http.StatusInternalServerError)
		return
	}
	response := UserInfoResponse{
		Username:       user.Username,
		Email:          *user.Email,
		Style:          user.Style,
		ProfilePicture: user.ProfilePicture,
		Name:           user.Name,
	}
	err = json.NewEncoder(w).Encode(response)
	if err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}
