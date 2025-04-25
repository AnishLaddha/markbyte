package api

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/shrijan-swaminathan/markbyte/backend/db"
	"github.com/shrijan-swaminathan/markbyte/backend/db/redisdb"
)

type PostData struct {
	Pfp       string          `json:"pfp"`
	ViewCount int             `json:"view_count"`
	Blog      db.BlogPostData `json:"blog"`
}

type HandleDiscoverPostsResponse struct {
	Posts []PostData `json:"posts"`
}

func HandleDiscoverNewPosts(w http.ResponseWriter, r *http.Request) {
	if redisdb.RedisActive {
		cacheHit, err := redisdb.GetEndpoint(r.Context(), "discover:new")
		if err == nil && cacheHit != "" {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			_, err = w.Write([]byte(cacheHit))
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			return
		}
	}

	blogs, err := blogPostDataDB.FetchFiftyNewestPosts(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	pfp_map := make(map[string]string)
	post_data := make([]PostData, 0)

	var user_data *db.User
	var pfp string
	var ok bool
	for _, blog := range blogs {
		pfp, ok = pfp_map[blog.User]
		if !ok {
			user_data, err = userDB.GetUser(r.Context(), blog.User)
			if err != nil {
				pfp = ""
			} else {
				pfp = user_data.ProfilePicture
			}
			pfp_map[blog.User] = pfp
		}
		view_count, err := AnalyticsDataDB.GetPostViewCount(r.Context(), blog.User, blog.Title, blog.Version)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		post_data = append(post_data, PostData{
			Pfp:       pfp,
			Blog:      blog,
			ViewCount: view_count,
		})
	}
	response := HandleDiscoverPostsResponse{
		Posts: post_data,
	}

	if redisdb.RedisActive {
		respJSON, err := json.Marshal(response)
		if err == nil {
			str := string(respJSON)
			_ = redisdb.SetWithTTL(r.Context(), "discover:new", &str, 20*time.Minute)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

}

func HandleDiscoverTopPosts(w http.ResponseWriter, r *http.Request) {
	if redisdb.RedisActive {
		cacheHit, err := redisdb.GetEndpoint(r.Context(), "discover:top")
		if err == nil && cacheHit != "" {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			_, err = w.Write([]byte(cacheHit))
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			return
		}
	}

	analyticsList, err := AnalyticsDataDB.GetMostViewedPosts(r.Context(), 100)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	postData := make([]PostData, 0, 50)
	pfpMap := make(map[string]string)

	for _, analytics := range analyticsList {
		if len(postData) >= 50 {
			break
		}
		active, err := blogPostDataDB.IsPostActive(r.Context(), analytics.Username, analytics.Title, analytics.Version)
		if err != nil || !active {
			continue
		}
		blog := db.BlogPostData{
			User:         analytics.Username,
			Title:        analytics.Title,
			Version:      analytics.Version,
			DateUploaded: analytics.Date,
			IsActive:     true,
		}
		pfp, ok := pfpMap[blog.User]
		if !ok {
			userData, err := userDB.GetUser(r.Context(), blog.User)
			if err != nil {
				pfp = ""
			} else {
				pfp = userData.ProfilePicture
			}
			pfpMap[blog.User] = pfp
		}

		postData = append(postData, PostData{
			Pfp:       pfp,
			Blog:      blog,
			ViewCount: analytics.ViewCount,
		})
	}
	response := HandleDiscoverPostsResponse{
		Posts: postData,
	}

	if redisdb.RedisActive {
		respJSON, err := json.Marshal(response)
		if err == nil {
			str := string(respJSON)
			_ = redisdb.SetWithTTL(r.Context(), "discover:top", &str, 20*time.Minute)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(response); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

}
