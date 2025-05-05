package server

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/shrijan-swaminathan/markbyte/backend/auth"
	"github.com/shrijan-swaminathan/markbyte/backend/db"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// Mock UserDB implementation
type MockUserDB struct {
	mock.Mock
}

func (m *MockUserDB) CreateUser(ctx context.Context, user *db.User) (string, error) {
	args := m.Called(ctx, user)
	return args.String(0), args.Error(1)
}

func (m *MockUserDB) GetUser(ctx context.Context, username string) (*db.User, error) {
	args := m.Called(ctx, username)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*db.User), args.Error(1)
}

func (m *MockUserDB) RemoveUser(ctx context.Context, username string) error {
	args := m.Called(ctx, username)
	return args.Error(0)
}

func (m *MockUserDB) GetUserStyle(ctx context.Context, username string) (string, error) {
	args := m.Called(ctx, username)
	return args.String(0), args.Error(1)
}

func (m *MockUserDB) UpdateUserStyle(ctx context.Context, username string, style string) error {
	args := m.Called(ctx, username, style)
	return args.Error(0)
}

func (m *MockUserDB) UpdateUserProfilePicture(ctx context.Context, username string, profilePicture string) error {
	args := m.Called(ctx, username, profilePicture)
	return args.Error(0)
}

func (m *MockUserDB) UpdateUserName(ctx context.Context, username string, name string) error {
	args := m.Called(ctx, username, name)
	return args.Error(0)
}

// Helper function to generate a valid JWT token for testing using the actual secret
func generateTestJWT(username string) string {
	_, tokenString, _ := auth.TokenAuth.Encode(jwt.MapClaims{
		"username": username,
		"exp":      time.Now().Add(time.Hour * 24).Unix(),
	})
	return tokenString
}

// Helper function to create a request with an Authorization header
func createAuthRequest(method, url, token string, body interface{}) (*http.Request, error) {
	var req *http.Request
	var err error

	if body != nil {
		jsonBody, err := json.Marshal(body)
		if err != nil {
			return nil, err
		}
		req, err = http.NewRequest(method, url, bytes.NewBuffer(jsonBody))
		if err != nil {
			return nil, err
		}
	} else {
		req, err = http.NewRequest(method, url, nil)
	}

	if err != nil {
		return nil, err
	}

	if token != "" {
		req.Header.Set("Authorization", "Bearer "+token)
	}
	req.Header.Set("Content-Type", "application/json")
	return req, nil
}

func TestCORSMiddleware(t *testing.T) {
	tests := []struct {
		name           string
		method         string
		expectedStatus int
		checkHeaders   func(*testing.T, *httptest.ResponseRecorder)
	}{
		{
			name:           "OPTIONS request",
			method:         http.MethodOptions,
			expectedStatus: http.StatusNoContent,
			checkHeaders: func(t *testing.T, w *httptest.ResponseRecorder) {
				assert.Equal(t, "https://markbyte.xyz", w.Header().Get("Access-Control-Allow-Origin"))
				assert.Equal(t, "GET, POST, PUT, DELETE, OPTIONS", w.Header().Get("Access-Control-Allow-Methods"))
				assert.Equal(t, "Content-Type, Authorization", w.Header().Get("Access-Control-Allow-Headers"))
				assert.Equal(t, "true", w.Header().Get("Access-Control-Allow-Credentials"))
			},
		},
		{
			name:           "GET request",
			method:         http.MethodGet,
			expectedStatus: http.StatusOK,
			checkHeaders: func(t *testing.T, w *httptest.ResponseRecorder) {
				assert.Equal(t, "https://markbyte.xyz", w.Header().Get("Access-Control-Allow-Origin"))
				assert.Equal(t, "GET, POST, PUT, DELETE, OPTIONS", w.Header().Get("Access-Control-Allow-Methods"))
				assert.Equal(t, "Content-Type, Authorization", w.Header().Get("Access-Control-Allow-Headers"))
				assert.Equal(t, "true", w.Header().Get("Access-Control-Allow-Credentials"))
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			testHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				w.WriteHeader(http.StatusOK)
			})

			handler := CORS(testHandler)
			req := httptest.NewRequest(tt.method, "/", nil)
			w := httptest.NewRecorder()
			handler.ServeHTTP(w, req)

			assert.Equal(t, tt.expectedStatus, w.Code)
			if tt.checkHeaders != nil {
				tt.checkHeaders(t, w)
			}
		})
	}
}

func TestSetupRouter(t *testing.T) {
	// Set up mock UserDB
	mockDB := new(MockUserDB)
	auth.SetUserDB(mockDB)

	// Set up expectations for the mock
	// For signup: check if user exists
	mockDB.On("GetUser", mock.Anything, "newuser").Return(nil, errors.New("user not found"))
	// For signup: create new user
	mockDB.On("CreateUser", mock.Anything, mock.MatchedBy(func(user *db.User) bool {
		return user.Username == "newuser" && user.Password != "" && *user.Email == "new@example.com"
	})).Return("", nil)

	// For login: get existing user
	hashedPassword, _ := auth.HashPassword("password123")
	mockDB.On("GetUser", mock.Anything, "testuser").Return(&db.User{
		Username: "testuser",
		Password: hashedPassword,
		Email:    stringPtr("test@example.com"),
	}, nil)

	// Create a router using the SetupRouter function
	router := SetupRouter()
	assert.NotNil(t, router)

	ts := httptest.NewServer(router)
	defer ts.Close()

	// Test public routes
	publicTests := []struct {
		name           string
		method         string
		path           string
		body           interface{}
		expectedStatus int
	}{
		{
			name:   "Signup route",
			method: http.MethodPost,
			path:   "/signup",
			body: map[string]string{
				"username": "newuser",
				"password": "password123",
				"email":    "new@example.com",
			},
			expectedStatus: http.StatusOK,
		},
		{
			name:   "Login route",
			method: http.MethodPost,
			path:   "/login",
			body: map[string]string{
				"username": "testuser",
				"password": "password123",
			},
			expectedStatus: http.StatusOK,
		},
		{
			name:           "Logout route",
			method:         http.MethodPost,
			path:           "/logout",
			expectedStatus: http.StatusOK,
		},
	}

	for _, tt := range publicTests {
		t.Run("Public: "+tt.name, func(t *testing.T) {
			req, err := createAuthRequest(tt.method, ts.URL+tt.path, "", tt.body)
			assert.NoError(t, err)

			resp, err := http.DefaultClient.Do(req)
			assert.NoError(t, err)
			defer resp.Body.Close()

			assert.NotEqual(t, http.StatusNotFound, resp.StatusCode, "Route not found: %s", tt.path)
		})
	}

	// Generate a valid JWT token for testing
	validToken := generateTestJWT("testuser")

	// Test protected routes
	protectedTests := []struct {
		name           string
		method         string
		path           string
		body           interface{}
		useValidToken  bool
		expectedStatus int
	}{
		{
			name:           "Auth route with valid token",
			method:         http.MethodGet,
			path:           "/auth",
			useValidToken:  true,
			expectedStatus: http.StatusOK,
		},
	}

	for _, tt := range protectedTests {
		t.Run("Protected: "+tt.name, func(t *testing.T) {
			token := ""
			if tt.useValidToken {
				token = validToken
			} else {
				token = "invalid-token"
			}

			req, err := createAuthRequest(tt.method, ts.URL+tt.path, token, tt.body)
			assert.NoError(t, err)

			resp, err := http.DefaultClient.Do(req)
			assert.NoError(t, err)
			defer resp.Body.Close()

			if tt.useValidToken {
				assert.NotEqual(t, http.StatusNotFound, resp.StatusCode, "Route not found: %s", tt.path)
				assert.NotEqual(t, http.StatusUnauthorized, resp.StatusCode, "Unauthorized access with valid token: %s", tt.path)
			} else {
				assert.True(t, resp.StatusCode == http.StatusUnauthorized || resp.StatusCode == http.StatusNotFound,
					"Unexpected status code for invalid token: %d, path: %s", resp.StatusCode, tt.path)
			}
		})
	}

	// Verify that all expected mock calls were made
	mockDB.AssertExpectations(t)
}

// Helper function to create a string pointer
func stringPtr(s string) *string {
	return &s
}
