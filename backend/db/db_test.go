package db

import (
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestUserStructFields(t *testing.T) {
	email := "test@example.com"
	user := User{
		Username:       "testuser",
		Password:       "hashed",
		Email:          &email,
		Style:          "default",
		ProfilePicture: "pfp.png",
		Name:           "Test User",
	}
	assert.Equal(t, "testuser", user.Username)
	assert.Equal(t, "hashed", user.Password)
	assert.Equal(t, &email, user.Email)
	assert.Equal(t, "default", user.Style)
	assert.Equal(t, "pfp.png", user.ProfilePicture)
	assert.Equal(t, "Test User", user.Name)
}

func TestBlogPostDataFields(t *testing.T) {
	now := time.Now()
	link := "link"
	direct := "direct"
	post := BlogPostData{
		User:         "testuser",
		Title:        "Title",
		DateUploaded: now,
		Version:      "1",
		IsActive:     true,
		Link:         &link,
		DirectLink:   &direct,
	}
	assert.Equal(t, "testuser", post.User)
	assert.Equal(t, "Title", post.Title)
	assert.Equal(t, now, post.DateUploaded)
	assert.Equal(t, "1", post.Version)
	assert.True(t, post.IsActive)
	assert.Equal(t, &link, post.Link)
	assert.Equal(t, &direct, post.DirectLink)
}

func TestPostAnalyticsFields(t *testing.T) {
	now := time.Now()
	analytics := PostAnalytics{
		Username:  "testuser",
		Title:     "Title",
		Version:   "1",
		Date:      now,
		Views:     []time.Time{now},
		ViewCount: 42,
		Likes:     []string{"alice", "bob"},
	}
	assert.Equal(t, "testuser", analytics.Username)
	assert.Equal(t, "Title", analytics.Title)
	assert.Equal(t, "1", analytics.Version)
	assert.Equal(t, now, analytics.Date)
	assert.Equal(t, []time.Time{now}, analytics.Views)
	assert.Equal(t, 42, analytics.ViewCount)
	assert.Equal(t, []string{"alice", "bob"}, analytics.Likes)
}
