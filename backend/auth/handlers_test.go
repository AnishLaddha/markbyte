package auth

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/shrijan-swaminathan/markbyte/backend/db"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

func TestHandleSignup(t *testing.T) {
	mockDB := new(MockUserDB)
	SetUserDB(mockDB)

	tests := []struct {
		name           string
		requestBody    interface{}
		setupMock      func()
		expectedStatus int
		expectedBody   string
	}{
		{
			name: "Successful signup",
			requestBody: UserRequest{
				Username: "newuser",
				Password: "password123",
				Email:    stringPtr("test@example.com"),
			},
			setupMock: func() {
				mockDB.On("GetUser", mock.Anything, "newuser").Return(nil, assert.AnError)
				mockDB.On("CreateUser", mock.Anything, mock.MatchedBy(func(user *db.User) bool {
					return user.Username == "newuser" && user.Email != nil && *user.Email == "test@example.com"
				})).Return("id", nil)
			},
			expectedStatus: http.StatusCreated,
			expectedBody:   `{"message":"User created successfully"}` + "\n",
		},
		{
			name: "User already exists",
			requestBody: UserRequest{
				Username: "existinguser",
				Password: "password123",
			},
			setupMock: func() {
				mockDB.On("GetUser", mock.Anything, "existinguser").Return(&db.User{}, nil)
			},
			expectedStatus: http.StatusBadRequest,
			expectedBody:   "User already exists\n",
		},
		{
			name: "Invalid username - reserved word",
			requestBody: UserRequest{
				Username: "login",
				Password: "password123",
			},
			setupMock:      func() {},
			expectedStatus: http.StatusBadRequest,
			expectedBody:   "Username is not allowed\n",
		},
		{
			name: "Missing username",
			requestBody: UserRequest{
				Password: "password123",
			},
			setupMock:      func() {},
			expectedStatus: http.StatusBadRequest,
			expectedBody:   "Username and Password are required\n",
		},
		{
			name: "Missing password",
			requestBody: UserRequest{
				Username: "newuser",
			},
			setupMock:      func() {},
			expectedStatus: http.StatusBadRequest,
			expectedBody:   "Username and Password are required\n",
		},
		{
			name:           "Invalid JSON",
			requestBody:    "invalid json",
			setupMock:      func() {},
			expectedStatus: http.StatusBadRequest,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tt.setupMock()

			var body io.Reader
			if str, ok := tt.requestBody.(string); ok {
				body = bytes.NewBufferString(str)
			} else {
				jsonBody, _ := json.Marshal(tt.requestBody)
				body = bytes.NewBuffer(jsonBody)
			}

			req := httptest.NewRequest("POST", "/signup", body)
			w := httptest.NewRecorder()

			HandleSignup(w, req)

			assert.Equal(t, tt.expectedStatus, w.Code)

			if tt.expectedBody != "" {
				assert.Equal(t, tt.expectedBody, w.Body.String())
			}

			mockDB.AssertExpectations(t)
		})
	}
}

func TestHandleLogin(t *testing.T) {
	mockDB := new(MockUserDB)
	SetUserDB(mockDB)

	hashedPassword, _ := HashPassword("password123")
	user := &db.User{
		Username: "testuser",
		Password: hashedPassword,
	}

	tests := []struct {
		name           string
		requestBody    interface{}
		setupMock      func()
		expectedStatus int
		checkResponse  func(*testing.T, *httptest.ResponseRecorder)
	}{
		{
			name: "Successful login",
			requestBody: UserRequest{
				Username: "testuser",
				Password: "password123",
			},
			setupMock: func() {
				mockDB.On("GetUser", mock.Anything, "testuser").Return(user, nil)
			},
			expectedStatus: http.StatusOK,
			checkResponse: func(t *testing.T, w *httptest.ResponseRecorder) {
				assert.Contains(t, w.Header().Get("Set-Cookie"), "markbyte_login_token")
				var response map[string]string
				err := json.NewDecoder(w.Body).Decode(&response)
				assert.NoError(t, err)
				assert.NotEmpty(t, response["token"])
			},
		},
		{
			name: "Invalid credentials",
			requestBody: UserRequest{
				Username: "testuser",
				Password: "wrongpassword",
			},
			setupMock: func() {
				mockDB.On("GetUser", mock.Anything, "testuser").Return(user, nil)
			},
			expectedStatus: http.StatusUnauthorized,
			checkResponse: func(t *testing.T, w *httptest.ResponseRecorder) {
				assert.Contains(t, w.Body.String(), "Unauthorized")
			},
		},
		{
			name: "User not found",
			requestBody: UserRequest{
				Username: "nonexistent",
				Password: "password123",
			},
			setupMock: func() {
				mockDB.On("GetUser", mock.Anything, "nonexistent").Return(nil, assert.AnError)
			},
			expectedStatus: http.StatusUnauthorized,
			checkResponse: func(t *testing.T, w *httptest.ResponseRecorder) {
				assert.NotContains(t, w.Header().Get("Set-Cookie"), "markbyte_login_token")
			},
		},
		{
			name:           "Invalid JSON",
			requestBody:    "invalid json",
			setupMock:      func() {},
			expectedStatus: http.StatusBadRequest,
			checkResponse: func(t *testing.T, w *httptest.ResponseRecorder) {
				assert.NotContains(t, w.Header().Get("Set-Cookie"), "markbyte_login_token")
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tt.setupMock()

			var body io.Reader
			if str, ok := tt.requestBody.(string); ok {
				body = bytes.NewBufferString(str)
			} else {
				jsonBody, _ := json.Marshal(tt.requestBody)
				body = bytes.NewBuffer(jsonBody)
			}

			req := httptest.NewRequest("POST", "/login", body)
			w := httptest.NewRecorder()

			HandleLogin(w, req)

			assert.Equal(t, tt.expectedStatus, w.Code)
			if tt.checkResponse != nil {
				tt.checkResponse(t, w)
			}

			mockDB.AssertExpectations(t)
		})
	}
}

func TestHandleLogout(t *testing.T) {
	tests := []struct {
		name           string
		setupRequest   func() *http.Request
		expectedStatus int
		checkResponse  func(*testing.T, *httptest.ResponseRecorder)
	}{
		{
			name: "Successful logout",
			setupRequest: func() *http.Request {
				return httptest.NewRequest("POST", "/logout", nil)
			},
			expectedStatus: http.StatusOK,
			checkResponse: func(t *testing.T, w *httptest.ResponseRecorder) {
				cookie := w.Header().Get("Set-Cookie")
				assert.Contains(t, cookie, "markbyte_login_token")
				assert.Contains(t, cookie, "Path=/")
				assert.Contains(t, cookie, "HttpOnly")
				assert.Contains(t, cookie, "Expires=")

				var response map[string]string
				err := json.NewDecoder(w.Body).Decode(&response)
				assert.NoError(t, err)
				assert.Equal(t, "Logged out successfully", response["message"])
			},
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := tt.setupRequest()
			w := httptest.NewRecorder()

			HandleLogout(w, req)

			assert.Equal(t, tt.expectedStatus, w.Code)
			if tt.checkResponse != nil {
				tt.checkResponse(t, w)
			}
		})
	}
}

func TestHandleLoggedInUser(t *testing.T) {
	tests := []struct {
		name           string
		setupRequest   func() *http.Request
		expectedStatus int
		expectedBody   string
	}{
		{
			name: "Valid user context",
			setupRequest: func() *http.Request {
				req := httptest.NewRequest("GET", "/user", nil)
				ctx := context.WithValue(req.Context(), UsernameKey, "testuser")
				return req.WithContext(ctx)
			},
			expectedStatus: http.StatusOK,
			expectedBody:   "testuser",
		},
		{
			name: "Missing user context",
			setupRequest: func() *http.Request {
				return httptest.NewRequest("GET", "/user", nil)
			},
			expectedStatus: http.StatusUnauthorized,
			expectedBody:   "Unauthorized\n",
		},
		{
			name: "Empty username in context",
			setupRequest: func() *http.Request {
				req := httptest.NewRequest("GET", "/user", nil)
				ctx := context.WithValue(req.Context(), UsernameKey, "")
				return req.WithContext(ctx)
			},
			expectedStatus: http.StatusUnauthorized,
			expectedBody:   "Unauthorized\n",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := tt.setupRequest()
			w := httptest.NewRecorder()

			HandleLoggedInUser(w, req)

			assert.Equal(t, tt.expectedStatus, w.Code)
			assert.Equal(t, tt.expectedBody, w.Body.String())
		})
	}
}

func stringPtr(s string) *string {
	return &s
}
