package api

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/shrijan-swaminathan/markbyte/backend/auth"
	"github.com/shrijan-swaminathan/markbyte/backend/db"
)

var AnalyticsDataDB db.AnalyticsDB

func SetAnalyticsDB(repo db.AnalyticsDB) {
	AnalyticsDataDB = repo
}

func HandleGetPostAnalytics(w http.ResponseWriter, r *http.Request) {
	username, ok := r.Context().Value(auth.UsernameKey).(string)
	if !ok || username == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	title := r.URL.Query().Get("title")
	version := r.URL.Query().Get("version")

	analytics, err := AnalyticsDataDB.GetPostAnalytics(r.Context(), username, title, version)
	if err != nil {
		http.Error(w, "Failed to fetch analytics", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(analytics)
	if err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}

func HandleLikePost(w http.ResponseWriter, r *http.Request) {
	username, ok := r.Context().Value(auth.UsernameKey).(string)
	if !ok || username == "" {
		fmt.Printf("Unauthorized\n")
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	title := r.URL.Query().Get("title")
	version, err := blogPostDataDB.FetchActiveBlog(r.Context(), username, title)
	if err != nil {
		fmt.Printf("Failed to fetch active blog: %v\n", err)
		http.Error(w, "Failed to fetch active blog", http.StatusInternalServerError)
		return
	}

	err = AnalyticsDataDB.IncrementLikes(r.Context(), username, title, version)
	if err != nil {
		fmt.Printf("Failed to update likes: %v\n", err)
		http.Error(w, "Failed to update likes", http.StatusInternalServerError)
		return
	}
	fmt.Printf("%s %s %s\n", username, title, version)
	updatedAnalytics, err := AnalyticsDataDB.GetPostAnalytics(r.Context(), username, title, version)
	if err != nil {
		fmt.Printf("Failed to fetch updated analytics: %v\n", err)
		http.Error(w, "Failed to fetch updated analytics", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(updatedAnalytics)
	if err != nil {
		fmt.Printf("Failed to encode response: %v\n", err)
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}
