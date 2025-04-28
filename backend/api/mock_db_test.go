package api

import (
	"context"
	"time"

	"github.com/shrijan-swaminathan/markbyte/backend/db"
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
