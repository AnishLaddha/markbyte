package api_test

// import (
// 	"context"
// 	"encoding/json"
// 	"net/http"
// 	"net/http/httptest"
// 	"strings"
// 	"testing"
// 	"time"

// 	"github.com/shrijan-swaminathan/markbyte/backend/api"
// 	"github.com/shrijan-swaminathan/markbyte/backend/db"
// 	"github.com/shrijan-swaminathan/markbyte/backend/auth"
// 	"github.com/stretchr/testify/assert"
// 	"github.com/stretchr/testify/mock"
// )

// // MockBlogPostDataDB mocks the BlogPostDataDB interface for testing
// type MockBlogPostDataDB struct {
// 	mock.Mock
// }

// func (m *MockBlogPostDataDB) CreateBlogPost(ctx context.Context, post *db.BlogPostData) (string, error) {
// 	args := m.Called(ctx, post)
// 	return args.String(0), args.Error(1)
// }

// func (m *MockBlogPostDataDB) DeleteBlogPost(ctx context.Context, username string, title string, version string) error {
// 	args := m.Called(ctx, username, title, version)
// 	return args.Error(0)
// }

// func (m *MockBlogPostDataDB) UpdateActiveStatus(ctx context.Context, username string, title string, version string, isActive bool) error {
// 	args := m.Called(ctx, username, title, version, isActive)
// 	return args.Error(0)
// }

// func (m *MockBlogPostDataDB) FetchAllUserBlogPosts(ctx context.Context, username string) ([]db.BlogPostVersionsData, error) {
// 	args := m.Called(ctx, username)
// 	return args.Get(0).([]db.BlogPostVersionsData), args.Error(1)
// }

// func (m *MockBlogPostDataDB) FetchAllPostVersions(ctx context.Context, username string, title string) (db.BlogPostVersionsData, error) {
// 	args := m.Called(ctx, username, title)
// 	return args.Get(0).(db.BlogPostVersionsData), args.Error(1)
// }

// func (m *MockBlogPostDataDB) FetchAllActiveBlogPosts(ctx context.Context, username string) ([]db.BlogPostData, error) {
// 	args := m.Called(ctx, username)
// 	return args.Get(0).([]db.BlogPostData), args.Error(1)
// }

// func TestHandleFetchAllBlogPosts(t *testing.T) {
// 	// Setup
// 	mockDB := new(MockBlogPostDataDB)
// 	api.SetBlogPostDataDB(mockDB)

// 	t.Run("Successful fetch", func(t *testing.T) {
// 		expectedBlogs := []db.BlogPostVersionsData{{
// 			User:  "testuser",
// 			Title: "My First Post",
// 			Versions: []db.BlogPostData{
// 				{
// 					User:         "testuser",
// 					Title:        "My First Post",
// 					DateUploaded: time.Now(),
// 					Version:      "1",
// 					IsActive:     true,
// 				},
// 			},
// 			LatestVersion: "1",
// 			ActiveVersion: "1",
// 		}}

// 		mockDB.On("FetchAllUserBlogPosts", mock.Anything, "testuser").Return(expectedBlogs, nil)

// 		req := httptest.NewRequest("GET", "/user/blog_posts", nil)
// 		ctx := context.WithValue(req.Context(), auth.UsernameKey, "testuser")
// 		req = req.WithContext(ctx)

// 		w := httptest.NewRecorder()
// 		api.HandleFetchAllBlogPosts(w, req)

// 		assert.Equal(t, http.StatusOK, w.Code)

// 		var actualBlogs []db.BlogPostVersionsData
// 		err := json.Unmarshal(w.Body.Bytes(), &actualBlogs)
// 		assert.NoError(t, err)

// 		assert.Equal(t, expectedBlogs, actualBlogs)

// 		mockDB.AssertExpectations(t)
// 	})

// 	t.Run("Unauthorized: no username", func(t *testing.T) {
// 		req := httptest.NewRequest("GET", "/user/blog_posts", nil)
// 		w := httptest.NewRecorder()

// 		api.HandleFetchAllBlogPosts(w, req)

// 		assert.Equal(t, http.StatusUnauthorized, w.Code)
// 	})

// 	t.Run("Internal Server Error: database failure", func(t *testing.T) {
// 		mockDB.On("FetchAllUserBlogPosts", mock.Anything, "testuser").Return([]db.BlogPostVersionsData{}, assert.AnError)

// 		req := httptest.NewRequest("GET", "/user/blog_posts", nil)
// 		ctx := context.WithValue(req.Context(), auth.UsernameKey, "testuser")
// 		req = req.WithContext(ctx)

// 		w := httptest.NewRecorder()
// 		api.HandleFetchAllBlogPosts(w, req)

// 		assert.Equal(t, http.StatusInternalServerError, w.Code)
// 		mockDB.AssertExpectations(t)
// 	})
// }

// func TestHandlePublishPostVersion(t *testing.T) {
// 	mockDB := new(MockBlogPostDataDB)
// 	api.SetBlogPostDataDB(mockDB)

// 	postVersionReq := api.PublishPostVersion{
// 		Username: "testuser",
// 		Title:    "testtitle",
// 		Version:  "1",
// 	}

// 	postVersionReqJson, _ := json.Marshal(postVersionReq)

// 	t.Run("Successful publish post version", func(t *testing.T) {
// 		mockDB.On("FetchAllPostVersions", mock.Anything, postVersionReq.Username, postVersionReq.Title).Return(db.BlogPostVersionsData{
// 			User:  postVersionReq.Username,
// 			Title: postVersionReq.Title,
// 			Versions: []db.BlogPostData{
// 				{
// 					User:         postVersionReq.Username,
// 					Title:        postVersionReq.Title,
// 					DateUploaded: time.Now(),
// 					Version:      "1",
// 					IsActive:     false,
// 				},
// 			},
// 			LatestVersion: "1",
// 			ActiveVersion: "1",
// 		}, nil)

// 		mockDB.On("UpdateActiveStatus", mock.Anything, postVersionReq.Username, postVersionReq.Title, postVersionReq.Version, true).Return(nil)

// 		req := httptest.NewRequest("POST", "/publish", strings.NewReader(string(postVersionReqJson)))
// 		ctx := context.WithValue(req.Context(), auth.UsernameKey, postVersionReq.Username)
// 		req = req.WithContext(ctx)

// 		w := httptest.NewRecorder()
// 		api.HandlePublishPostVersion(w, req)

// 		assert.Equal(t, http.StatusOK, w.Code)

// 		mockDB.AssertExpectations(t)
// 	})
// }
