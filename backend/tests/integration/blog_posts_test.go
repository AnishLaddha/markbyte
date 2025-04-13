package integration

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type BlogPost struct {
	ID      string `json:"id"`
	Title   string `json:"title"`
	Content string `json:"content"`
	Author  string `json:"author"`
}

func (s *IntegrationTestSuite) TestCreateAndGetBlogPost() {
	// Create a new blog post
	post := BlogPost{
		Title:   "Test Blog Post",
		Content: "This is a test blog post content",
		Author:  "Test Author",
	}

	// Convert post to JSON
	postJSON, err := json.Marshal(post)
	require.NoError(s.T(), err)

	// Create request
	req := httptest.NewRequest("POST", "/api/blog-posts", bytes.NewBuffer(postJSON))
	req.Header.Set("Content-Type", "application/json")

	// Create response recorder
	rr := httptest.NewRecorder()

	// TODO: Replace with your actual handler
	// handler := api.NewBlogPostHandler(s.db)
	// handler.ServeHTTP(rr, req)

	// Assert response
	assert.Equal(s.T(), http.StatusCreated, rr.Code)

	// Parse response
	var createdPost BlogPost
	err = json.Unmarshal(rr.Body.Bytes(), &createdPost)
	require.NoError(s.T(), err)

	// Assert created post
	assert.NotEmpty(s.T(), createdPost.ID)
	assert.Equal(s.T(), post.Title, createdPost.Title)
	assert.Equal(s.T(), post.Content, createdPost.Content)
	assert.Equal(s.T(), post.Author, createdPost.Author)

	// Test getting the created post
	getReq := httptest.NewRequest("GET", "/api/blog-posts/"+createdPost.ID, nil)
	getRr := httptest.NewRecorder()

	// TODO: Replace with your actual handler
	// handler.ServeHTTP(getRr, getReq)

	// Assert response
	assert.Equal(s.T(), http.StatusOK, getRr.Code)

	// Parse response
	var retrievedPost BlogPost
	err = json.Unmarshal(getRr.Body.Bytes(), &retrievedPost)
	require.NoError(s.T(), err)

	// Assert retrieved post matches created post
	assert.Equal(s.T(), createdPost.ID, retrievedPost.ID)
	assert.Equal(s.T(), createdPost.Title, retrievedPost.Title)
	assert.Equal(s.T(), createdPost.Content, retrievedPost.Content)
	assert.Equal(s.T(), createdPost.Author, retrievedPost.Author)
}
