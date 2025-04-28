package api

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/shrijan-swaminathan/markbyte/backend/auth"
	"github.com/shrijan-swaminathan/markbyte/backend/db"
	"github.com/stretchr/testify/assert"
)

func TestHandleFetchBlogPost(t *testing.T) {
	// Save and override S3 functions
	origLoadCredentials := LoadCredentials
	origReadFilefromS3 := ReadFilefromS3
	LoadCredentials = func() (S3Credentials, error) { return S3Credentials{}, nil }
	ReadFilefromS3 = func(ctx context.Context, key string, cred S3Credentials) (string, error) {
		return "Test Blog Content", nil
	}
	defer func() {
		LoadCredentials = origLoadCredentials
		ReadFilefromS3 = origReadFilefromS3
	}()

	blogPostDataDB = &mockBlogPostDataDB{
		FetchActiveBlogFunc: func(ctx context.Context, username, title string) (string, error) {
			return "1", nil
		},
		FetchBlogPostFunc: func(ctx context.Context, username, title, version string) (db.BlogPostData, error) {
			return db.BlogPostData{
				User:         username,
				Title:        title,
				Version:      version,
				DateUploaded: time.Now(),
				IsActive:     true,
			}, nil
		},
	}
	userDB = &mockUserDB{}
	AnalyticsDataDB = &mockAnalyticsDataDB{}

	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("username", "testuser")
	rctx.URLParams.Add("post", "test_post")
	req := httptest.NewRequest("GET", "/", nil)
	req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))
	rr := httptest.NewRecorder()

	HandleFetchBlogPost(rr, req)

	assert.Equal(t, http.StatusOK, rr.Code)
	assert.Contains(t, rr.Body.String(), "Test Blog Content")
}

func TestHandleFetchMD(t *testing.T) {
	origLoadCredentials := LoadCredentials
	origReadFilefromS3 := ReadFilefromS3
	LoadCredentials = func() (S3Credentials, error) { return S3Credentials{}, nil }
	ReadFilefromS3 = func(ctx context.Context, key string, cred S3Credentials) (string, error) {
		return "Test Markdown Content", nil
	}
	defer func() {
		LoadCredentials = origLoadCredentials
		ReadFilefromS3 = origReadFilefromS3
	}()

	userDB = &mockUserDB{}
	blogPostDataDB = &mockBlogPostDataDB{}
	AnalyticsDataDB = &mockAnalyticsDataDB{}

	body := `{"title":"Test Post","version":"1"}`
	req := httptest.NewRequest("POST", "/", strings.NewReader(body))
	ctx := context.WithValue(req.Context(), auth.UsernameKey, "testuser")
	req = req.WithContext(ctx)
	rr := httptest.NewRecorder()

	HandleFetchMD(rr, req)

	assert.Equal(t, http.StatusOK, rr.Code)
	assert.Contains(t, rr.Body.String(), "Test Markdown Content")
}
