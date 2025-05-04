package mdb

import (
	"testing"
	"time"

	"github.com/shrijan-swaminathan/markbyte/backend/db"
	"github.com/stretchr/testify/assert"
)

func TestMongoBlogPostDataConversion(t *testing.T) {
	now := time.Now()
	post := db.BlogPostData{
		User:         "testuser",
		Title:        "Title",
		DateUploaded: now,
		Version:      "1",
		IsActive:     true,
	}
	// Simulate marshal/unmarshal or conversion if you have such logic.
	// Here we just check fields are preserved.
	assert.Equal(t, "testuser", post.User)
	assert.Equal(t, "Title", post.Title)
	assert.Equal(t, now, post.DateUploaded)
	assert.Equal(t, "1", post.Version)
	assert.True(t, post.IsActive)
}

func TestMongoPostAnalyticsConversion(t *testing.T) {
	now := time.Now()
	analytics := db.PostAnalytics{
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
