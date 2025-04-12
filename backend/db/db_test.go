package db

import (
	"context"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestUserStruct(t *testing.T) {
	// Test User struct creation and field access
	email := "test@example.com"
	user := &User{
		Username:       "testuser",
		Password:       "hashedpassword",
		Email:          &email,
		Style:          "default",
		ProfilePicture: "profile.jpg",
		Name:           "Test User",
	}

	assert.Equal(t, "testuser", user.Username)
	assert.Equal(t, "hashedpassword", user.Password)
	assert.Equal(t, "test@example.com", *user.Email)
	assert.Equal(t, "default", user.Style)
	assert.Equal(t, "profile.jpg", user.ProfilePicture)
	assert.Equal(t, "Test User", user.Name)
}

func TestBlogPostDataStruct(t *testing.T) {
	// Test BlogPostData struct creation and field access
	link := "https://example.com/post"
	directLink := "https://example.com/direct"
	post := &BlogPostData{
		User:         "testuser",
		Title:        "Test Post",
		DateUploaded: time.Now(),
		Version:      "1.0",
		Link:         &link,
		IsActive:     true,
		DirectLink:   &directLink,
	}

	assert.Equal(t, "testuser", post.User)
	assert.Equal(t, "Test Post", post.Title)
	assert.Equal(t, "1.0", post.Version)
	assert.Equal(t, "https://example.com/post", *post.Link)
	assert.True(t, post.IsActive)
	assert.Equal(t, "https://example.com/direct", *post.DirectLink)
}

func TestBlogPostVersionsDataStruct(t *testing.T) {
	// Test BlogPostVersionsData struct creation and field access
	versions := []BlogPostData{
		{
			User:         "testuser",
			Title:        "Test Post",
			Version:      "1.0",
			DateUploaded: time.Now(),
			IsActive:     true,
		},
		{
			User:         "testuser",
			Title:        "Test Post",
			Version:      "2.0",
			DateUploaded: time.Now(),
			IsActive:     false,
		},
	}

	postVersions := &BlogPostVersionsData{
		User:          "testuser",
		Title:         "Test Post",
		Versions:      versions,
		LatestVersion: "2.0",
		ActiveVersion: "1.0",
	}

	assert.Equal(t, "testuser", postVersions.User)
	assert.Equal(t, "Test Post", postVersions.Title)
	assert.Len(t, postVersions.Versions, 2)
	assert.Equal(t, "2.0", postVersions.LatestVersion)
	assert.Equal(t, "1.0", postVersions.ActiveVersion)
}

func TestPostAnalyticsStruct(t *testing.T) {
	// Test PostAnalytics struct creation and field access
	now := time.Now()
	views := []time.Time{now, now.Add(time.Hour)}
	likes := []string{"user1", "user2"}

	analytics := &PostAnalytics{
		Username: "testuser",
		Title:    "Test Post",
		Version:  "1.0",
		Date:     now,
		Views:    views,
		Likes:    likes,
	}

	assert.Equal(t, "testuser", analytics.Username)
	assert.Equal(t, "Test Post", analytics.Title)
	assert.Equal(t, "1.0", analytics.Version)
	assert.Equal(t, now, analytics.Date)
	assert.Len(t, analytics.Views, 2)
	assert.Len(t, analytics.Likes, 2)
	assert.Equal(t, "user1", analytics.Likes[0])
	assert.Equal(t, "user2", analytics.Likes[1])
}

// Test interface implementations
type mockUserDB struct{}

func (m *mockUserDB) CreateUser(ctx context.Context, user *User) (string, error) {
	return user.Username, nil
}

func (m *mockUserDB) GetUser(ctx context.Context, username string) (*User, error) {
	return &User{Username: username}, nil
}

func (m *mockUserDB) RemoveUser(ctx context.Context, username string) error {
	return nil
}

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

func TestUserDBInterface(t *testing.T) {
	// Test that mockUserDB implements UserDB interface
	var _ UserDB = (*mockUserDB)(nil)

	mock := &mockUserDB{}
	ctx := context.Background()

	// Test CreateUser
	user := &User{Username: "testuser"}
	id, err := mock.CreateUser(ctx, user)
	assert.NoError(t, err)
	assert.Equal(t, "testuser", id)

	// Test GetUser
	user, err = mock.GetUser(ctx, "testuser")
	assert.NoError(t, err)
	assert.Equal(t, "testuser", user.Username)

	// Test GetUserStyle
	style, err := mock.GetUserStyle(ctx, "testuser")
	assert.NoError(t, err)
	assert.Equal(t, "default", style)
}
