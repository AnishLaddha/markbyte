package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/shrijan-swaminathan/markbyte/backend/auth"
	"github.com/shrijan-swaminathan/markbyte/backend/db"
)

var AnalyticsDataDB db.AnalyticsDB

func SetAnalyticsDB(repo db.AnalyticsDB) {
	AnalyticsDataDB = repo
}

type PostAnalyticsRequest struct {
	Title    string `json:"title"`
	Username string `json:"username"`
	Version  string `json:"version"`
}

func HandleGetPostAnalytics(w http.ResponseWriter, r *http.Request) {
	username, ok := r.Context().Value(auth.UsernameKey).(string)
	if !ok || username == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	var postAnalyticsRequest PostAnalyticsRequest
	err := json.NewDecoder(r.Body).Decode(&postAnalyticsRequest)
	if err != nil {
		http.Error(w, "Failed to decode request body", http.StatusBadRequest)
		return
	}
	activeVersion, err := blogPostDataDB.FetchActiveBlog(r.Context(), postAnalyticsRequest.Username, postAnalyticsRequest.Title)
	if err != nil {
		http.Error(w, "Failed to fetch active version", http.StatusInternalServerError)
		return
	}
	analytics, err := AnalyticsDataDB.GetPostAnalytics(r.Context(), username, postAnalyticsRequest.Title, activeVersion)
	if err != nil {
		http.Error(w, "Failed to fetch analytics", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(analytics)
	if err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}

type LikePostRequest struct {
	PostUsername string `json:"post_username"`
	Title        string `json:"title"`
}

type LikePostResponse struct {
	Liked bool `json:"liked"`
}

func HandleLikePost(w http.ResponseWriter, r *http.Request) {
	username, ok := r.Context().Value(auth.UsernameKey).(string)
	if !ok || username == "" {
		fmt.Printf("Unauthorized\n")
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	var likePostRequest LikePostRequest
	err := json.NewDecoder(r.Body).Decode(&likePostRequest)
	if err != nil {
		http.Error(w, "Failed to decode request body", http.StatusBadRequest)
		return
	}
	//first, get the active version of the post
	activeVersion, err := blogPostDataDB.FetchActiveBlog(r.Context(), likePostRequest.PostUsername, likePostRequest.Title)
	if err != nil {
		http.Error(w, "Failed to fetch active version", http.StatusInternalServerError)
	}
	liked, err := AnalyticsDataDB.ToggleLike(r.Context(), likePostRequest.PostUsername, likePostRequest.Title, activeVersion, username)
	if err != nil {
		http.Error(w, "Failed to toggle like", http.StatusInternalServerError)
		return
	}
	likePostResponse := LikePostResponse{Liked: liked}
	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(likePostResponse)
	if err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}

type PublicPostDataRequest struct {
	Title    string `json:"title"`
	Username string `json:"username"`
}

type PublicPostAnalyticsResponse struct {
	Views int `json:"views"`
	Likes int `json:"likes"`
}

func HandlePublicPostAnalytics(w http.ResponseWriter, r *http.Request) {
	var publicPostDataRequest PublicPostDataRequest
	err := json.NewDecoder(r.Body).Decode(&publicPostDataRequest)
	if err != nil {
		http.Error(w, "Failed to decode request body", http.StatusBadRequest)
		return
	}
	activeVersion, err := blogPostDataDB.FetchActiveBlog(r.Context(), publicPostDataRequest.Username, publicPostDataRequest.Title)
	if err != nil {
		http.Error(w, "Failed to fetch active version", http.StatusInternalServerError)
	}
	analytics, err := AnalyticsDataDB.GetPostAnalytics(r.Context(), publicPostDataRequest.Username, publicPostDataRequest.Title, activeVersion)
	if err != nil {
		http.Error(w, "Failed to fetch analytics", http.StatusInternalServerError)
	}
	publicPostAnalyticsResponse := PublicPostAnalyticsResponse{Views: len(analytics.Views), Likes: len(analytics.Likes)}
	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(publicPostAnalyticsResponse)
	if err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}

type UserActiveAnalyticsResponse struct {
	PostTimestamps []time.Time `json:"post_timestamps"`
}

func HandleUserActiveAnalytics(w http.ResponseWriter, r *http.Request) {
	username, ok := r.Context().Value(auth.UsernameKey).(string)
	if !ok || username == "" {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	active_posts, err := blogPostDataDB.FetchAllActiveBlogPosts(r.Context(), username)
	if err != nil {
		http.Error(w, "Failed to fetch active posts", http.StatusInternalServerError)
	}
	post_timestamps, err := AnalyticsDataDB.GetAllPostTimeStamps(r.Context(), username, active_posts)
	if err != nil {
		http.Error(w, "Failed to fetch post timestamps", http.StatusInternalServerError)
	}
	userActiveAnalyticsResponse := UserActiveAnalyticsResponse{PostTimestamps: post_timestamps}
	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(userActiveAnalyticsResponse)
	if err != nil {
		http.Error(w, "Failed to encode response", http.StatusInternalServerError)
		return
	}
}
