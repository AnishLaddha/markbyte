package api

import (
	"encoding/json"
	"net/http"

	"github.com/shrijan-swaminathan/markbyte/backend/auth"
)

type UpdateUserNameRequest struct {
	Name string `json:"name"`
}

func HandleUpdateUserName(w http.ResponseWriter, r *http.Request) {
	username, ok := r.Context().Value(auth.UsernameKey).(string)
	if !ok || username == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	var req UpdateUserNameRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Failed to decode request", http.StatusBadRequest)
		return
	}
	err = userDB.UpdateUserName(r.Context(), username, req.Name)
	if err != nil {
		http.Error(w, "Failed to update user name", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}
