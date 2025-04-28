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

// --- Mock Structs with Overrideable Methods ---

type mockBlogPostDataDB struct {
	FetchActiveBlogFunc func(ctx context.Context, username, title string) (string, error)
	FetchBlogPostFunc   func(ctx context.Context, username, title, version string) (db.BlogPostData, error)
}

func (m *mockBlogPostDataDB) FetchActiveBlog(ctx context.Context, username, title string) (string, error) {
	if m.FetchActiveBlogFunc != nil {
		return m.FetchActiveBlogFunc(ctx, username, title)
	}
	return "1", nil
}
func (m *mockBlogPostDataDB) FetchBlogPost(ctx context.Context, username, title, version string) (db.BlogPostData, error) {
	if m.FetchBlogPostFunc != nil {
		return m.FetchBlogPostFunc(ctx, username, title, version)
	}
	return db.BlogPostData{
		User:         username,
		Title:        title,
		Version:      version,
		DateUploaded: time.Now(),
		IsActive:     true,
	}, nil
}

// Add empty stubs for unused methods to satisfy the interface
func (m *mockBlogPostDataDB) CreateBlogPost(ctx context.Context, post *db.BlogPostData) (string, error) {
	return "mock", nil
}
func (m *mockBlogPostDataDB) DeleteBlogPost(ctx context.Context, username, title string) (int, error) {
	return 1, nil
}
func (m *mockBlogPostDataDB) UpdateActiveStatus(ctx context.Context, username, title, version string, isActive bool) error {
	return nil
}
func (m *mockBlogPostDataDB) FetchAllUserBlogPosts(ctx context.Context, username string) ([]db.BlogPostVersionsData, error) {
	return nil, nil
}
func (m *mockBlogPostDataDB) FetchAllPostVersions(ctx context.Context, username, title string) (db.BlogPostVersionsData, error) {
	return db.BlogPostVersionsData{}, nil
}
func (m *mockBlogPostDataDB) FetchAllActiveBlogPosts(ctx context.Context, username string) ([]db.BlogPostData, error) {
	return nil, nil
}
func (m *mockBlogPostDataDB) FetchFiftyNewestPosts(ctx context.Context) ([]db.BlogPostData, error) {
	return nil, nil
}
func (m *mockBlogPostDataDB) IsPostActive(ctx context.Context, username, title, version string) (bool, error) {
	return true, nil
}

type mockUserDB struct{}

func (m *mockUserDB) GetUser(ctx context.Context, username string) (*db.User, error) {
	email := "mock@example.com"
	return &db.User{
		Username: username,
		Email:    &email,
		Name:     "Mock User",
		Style:    "default",
	}, nil
}

// Add empty stubs for unused methods
func (m *mockUserDB) CreateUser(ctx context.Context, user *db.User) (string, error) {
	return "mock", nil
}
func (m *mockUserDB) RemoveUser(ctx context.Context, username string) error { return nil }
func (m *mockUserDB) GetUserStyle(ctx context.Context, username string) (string, error) {
	return "default", nil
}
func (m *mockUserDB) UpdateUserStyle(ctx context.Context, username string, style string) error {
	return nil
}
func (m *mockUserDB) UpdateUserProfilePicture(ctx context.Context, username string, profilePicture string) error {
	return nil
}
func (m *mockUserDB) UpdateUserName(ctx context.Context, username string, name string) error {
	return nil
}

type mockAnalyticsDataDB struct{}

func (m *mockAnalyticsDataDB) IncrementViews(ctx context.Context, username, title, version string) error {
	return nil
}

// Add empty stubs for unused methods
func (m *mockAnalyticsDataDB) CreatePostAnalytics(ctx context.Context, post *db.PostAnalytics) (string, error) {
	return "mock", nil
}
func (m *mockAnalyticsDataDB) GetPostAnalytics(ctx context.Context, username, title, version string) (db.PostAnalytics, error) {
	return db.PostAnalytics{}, nil
}
func (m *mockAnalyticsDataDB) ToggleLike(ctx context.Context, postUsername, title, version, likingUsername string) (bool, error) {
	return true, nil
}
func (m *mockAnalyticsDataDB) DeletePostAnalytics(ctx context.Context, username, title string) (int, error) {
	return 1, nil
}
func (m *mockAnalyticsDataDB) GetAllPostTimeStamps(ctx context.Context, username string, active_posts []db.BlogPostData) ([]time.Time, error) {
	return nil, nil
}
func (m *mockAnalyticsDataDB) GetPostViewCount(ctx context.Context, username, title, version string) (int, error) {
	return 1, nil
}
func (m *mockAnalyticsDataDB) GetMostViewedPosts(ctx context.Context, limit int) ([]db.PostAnalytics, error) {
	return nil, nil
}

// --- Tests ---

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
