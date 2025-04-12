package api

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/shrijan-swaminathan/markbyte/backend/auth"
	"github.com/shrijan-swaminathan/markbyte/backend/db"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// MockBlogPostDataDB is a mock implementation of the BlogPostDataDB interface
type MockBlogPostDataDB struct {
	mock.Mock
}

// Implement all the methods required by the BlogPostDataDB interface
func (m *MockBlogPostDataDB) CreateBlogPost(ctx context.Context, post db.BlogPostData) (string, error) {
	args := m.Called(ctx, post)
	return args.String(0), args.Error(1)
}

func (m *MockBlogPostDataDB) DeleteBlogPost(ctx context.Context, username string, title string) (int, error) {
	args := m.Called(ctx, username, title)
	return args.Int(0), args.Error(1)
}

func (m *MockBlogPostDataDB) UpdateActiveStatus(ctx context.Context, username string, title string, version string, isActive bool) error {
	args := m.Called(ctx, username, title, version, isActive)
	return args.Error(0)
}

func (m *MockBlogPostDataDB) FetchAllUserBlogPosts(ctx context.Context, username string) (db.BlogPostVersionsData, error) {
	args := m.Called(ctx, username)
	return args.Get(0).(db.BlogPostVersionsData), args.Error(1)
}

func (m *MockBlogPostDataDB) FetchAllPostVersions(ctx context.Context, username string, title string) (db.BlogPostVersionsData, error) {
	args := m.Called(ctx, username, title)
	return args.Get(0).(db.BlogPostVersionsData), args.Error(1)
}

func (m *MockBlogPostDataDB) FetchAllActiveBlogPosts(ctx context.Context, username string) ([]db.BlogPostData, error) {
	args := m.Called(ctx, username)
	return args.Get(0).([]db.BlogPostData), args.Error(1)
}

func (m *MockBlogPostDataDB) FetchActiveBlog(ctx context.Context, username string, title string) (string, error) {
	args := m.Called(ctx, username, title)
	return args.String(0), args.Error(1)
}

// Tests for HandleFetchALlBlogPosts function

func TestHandleFetchAllBlogPosts(t *testing.T) {
	// Create a mock for the BlogPostDataDB
	mockDB := new(MockBlogPostDataDB)

	// Set the mock as the implementation for the tests
	SetBlogPostDataDB(mockDB)

	t.Run("Successful fetch", func(t *testing.T) {
		// Setup expected data
		username := "testuser"
		expectedPosts := db.BlogPostVersionsData{
			User:          username,
			Title:         "Test Blog",
			Versions:      []db.BlogPostData{},
			LatestVersion: "1",
			ActiveVersion: "1",
		}

		// Setup mock expectations
		mockDB.On("FetchAllUserBlogPosts", mock.Anything, username).Return(expectedPosts, nil)

		// Create a test request
		req := httptest.NewRequest(http.MethodGet, "/userblogposts", nil)

		// Add the username to the context
		ctx := context.WithValue(req.Context(), auth.UsernameKey, username)
		req = req.WithContext(ctx)

		// Create a response recorder
		w := httptest.NewRecorder()

		// Call the handler
		HandleFetchAllBlogPosts(w, req)

		// Assert the response
		assert.Equal(t, http.StatusOK, w.Code)

		// Parse the response body
		var response db.BlogPostVersionsData
		err := json.Unmarshal(w.Body.Bytes(), &response)
		assert.NoError(t, err)
		assert.Equal(t, expectedPosts, response)

		// Verify that the mock was called as expected
		mockDB.AssertExpectations(t)
	})

	t.Run("Unauthorized", func(t *testing.T) {
		// Create a test request without username in context
		req := httptest.NewRequest(http.MethodGet, "/userblogposts", nil)
		w := httptest.NewRecorder()

		// Call the handler
		HandleFetchAllBlogPosts(w, req)

		// Assert the response
		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})

	t.Run("Database error", func(t *testing.T) {
		username := "testuser"

		// Setup mock to return an error
		mockDB.On("FetchAllUserBlogPosts", mock.Anything, username).Return(db.BlogPostVersionsData{}, fmt.Errorf("database error"))

		// Create a test request
		req := httptest.NewRequest(http.MethodGet, "/userblogposts", nil)

		// Add the username to the context
		ctx := context.WithValue(req.Context(), auth.UsernameKey, username)
		req = req.WithContext(ctx)

		w := httptest.NewRecorder()

		// Call the handler
		HandleFetchAllBlogPosts(w, req)

		// Assert the response
		assert.Equal(t, http.StatusInternalServerError, w.Code)

		// Verify that the mock was called as expected
		mockDB.AssertExpectations(t)
	})
}

// Tests for the HandlePublishPostVersion function
func TestHandlePublishPostVersion(t *testing.T) {
	mockDB := new(MockBlogPostDataDB)
	SetBlogPostDataDB(mockDB)

	t.Run("Successful publish", func(t *testing.T) {
		// Setup test data
		postVersionReq := PublishPostVersion{
			Username: "testuser",
			Title:    "testtitle",
			Version:  "1",
		}

		// Convert request to JSON
		postVersionReqJson, _ := json.Marshal(postVersionReq)

		// Setup mock expectations
		mockDB.On("FetchAllPostVersions", mock.Anything, postVersionReq.Username, postVersionReq.Title).Return(
			db.BlogPostVersionsData{
				User:  postVersionReq.Username,
				Title: postVersionReq.Title,
				Versions: []db.BlogPostData{
					{
						User:         postVersionReq.Username,
						Title:        postVersionReq.Title,
						Version:      "1",
						IsActive:     false,
						DateUploaded: time.Now(),
					},
				},
				LatestVersion: "1",
				ActiveVersion: "1",
			}, nil)

		mockDB.On("UpdateActiveStatus", mock.Anything, postVersionReq.Username, postVersionReq.Title, postVersionReq.Version, true).Return(nil)

		// Create request
		req := httptest.NewRequest(http.MethodPost, "/publish", bytes.NewReader(postVersionReqJson))
		req.Header.Set("Content-Type", "application/json")

		// Add username to context
		ctx := context.WithValue(req.Context(), auth.UsernameKey, postVersionReq.Username)
		req = req.WithContext(ctx)

		w := httptest.NewRecorder()

		// Call handler
		HandlePublishPostVersion(w, req)

		// Assert response
		assert.Equal(t, http.StatusOK, w.Code)
		mockDB.AssertExpectations(t)
	})

	t.Run("Unauthorized - different username", func(t *testing.T) {
		// Setup test data with mismatched usernames
		postVersionReq := PublishPostVersion{
			Username: "testuser",
			Title:    "testtitle",
			Version:  "1",
		}

		postVersionReqJson, _ := json.Marshal(postVersionReq)

		// Create request with different username in context
		req := httptest.NewRequest(http.MethodPost, "/publish", bytes.NewReader(postVersionReqJson))
		req.Header.Set("Content-Type", "application/json")

		ctx := context.WithValue(req.Context(), auth.UsernameKey, "differentuser")
		req = req.WithContext(ctx)

		w := httptest.NewRecorder()

		// Call handler
		HandlePublishPostVersion(w, req)

		// Assert response
		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})
}
