package api

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/shrijan-swaminathan/markbyte/backend/auth"
	"github.com/shrijan-swaminathan/markbyte/backend/db/redisdb"
)

func HandleFetchUserStyle(w http.ResponseWriter, r *http.Request) {
	username, ok := r.Context().Value(auth.UsernameKey).(string)
	if !ok || username == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	style, err := userDB.GetUserStyle(r.Context(), username)
	if err != nil {
		http.Error(w, "Failed to get user style", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(style))
}

type UpdateUserStyleRequest struct {
	Style string `json:"style"`
}

func HandleUpdateUserStyle(w http.ResponseWriter, r *http.Request) {
	username, ok := r.Context().Value(auth.UsernameKey).(string)
	if !ok || username == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	var req UpdateUserStyleRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		http.Error(w, "Failed to decode request", http.StatusBadRequest)
		return
	}
	err = userDB.UpdateUserStyle(r.Context(), username, req.Style)
	if err != nil {
		http.Error(w, "Failed to update user style", http.StatusInternalServerError)
		return
	}
	if redisdb.RedisActive {
		err = redisdb.DeleteEndpointByPrefix(r.Context(), "/"+username)
		if err != nil {
			fmt.Printf("Error removing old endpoint from redis")
		}
	}
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("User style updated successfully"))
}
