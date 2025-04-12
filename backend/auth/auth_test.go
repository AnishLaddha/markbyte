// auth/auth_test.go
package auth

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/shrijan-swaminathan/markbyte/backend/db"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// MockUserDB is a mock implementation of the UserDB interface
type MockUserDB struct {
	mock.Mock
}

// Implement UserDB interface methods
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

func TestHashPassword(t *testing.T) {
	password := "testPassword123"
	hash, err := HashPassword(password)
	assert.NoError(t, err)
	assert.NotEqual(t, password, hash)
	assert.True(t, VerifyPassword(hash, password))
	assert.False(t, VerifyPassword(hash, "wrongPassword"))
}

func TestGenerateJWT(t *testing.T) {
	username := "testuser"
	token, expTime, err := GenerateJWT(username)
	assert.NoError(t, err)
	assert.NotEmpty(t, token)
	assert.True(t, expTime.After(time.Now()))

	// Test token validation
	validatedToken, err := ValidateJWT(token)
	assert.NoError(t, err)
	assert.NotNil(t, validatedToken)

	claims, ok := validatedToken.Claims.(jwt.MapClaims)
	assert.True(t, ok)
	assert.Equal(t, username, claims["username"])
}

func TestValidateJWT(t *testing.T) {
	// Test valid token
	username := "testuser"
	token, _, _ := GenerateJWT(username)
	validatedToken, err := ValidateJWT(token)
	assert.NoError(t, err)
	assert.NotNil(t, validatedToken)

	// Test invalid token
	invalidToken := "invalid.token.string"
	_, err = ValidateJWT(invalidToken)
	assert.Error(t, err)

	// Test expired token
	expiredToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"username": username,
		"exp":      time.Now().Add(-1 * time.Hour).Unix(),
	})
	expiredTokenString, _ := expiredToken.SignedString(jwtSecret)
	_, err = ValidateJWT(expiredTokenString)
	assert.Error(t, err)
}

func TestSetUserDB(t *testing.T) {
	// Create a mock UserDB
	mockDB := new(MockUserDB)
	
	// Call SetUserDB
	SetUserDB(mockDB)
	
	// Verify that the global userDB is set correctly
	// We can do this by trying to use it in a function that requires userDB
	mockDB.On("GetUser", mock.Anything, "testuser").Return(&db.User{}, nil)
	
	_, err := userDB.GetUser(context.Background(), "testuser")
	assert.NoError(t, err)
	mockDB.AssertExpectations(t)
}

func TestJWTAuthMiddleware(t *testing.T) {
	tests := []struct {
		name           string
		setupRequest   func() *http.Request
		expectedStatus int
		expectedUser   string
	}{
		{
			name: "Valid JWT in Cookie",
			setupRequest: func() *http.Request {
				token, _, _ := GenerateJWT("testuser")
				req := httptest.NewRequest("GET", "/", nil)
				req.AddCookie(&http.Cookie{
					Name:  "markbyte_login_token",
					Value: token,
				})
				return req
			},
			expectedStatus: http.StatusOK,
			expectedUser:   "testuser",
		},
		{
			name: "Valid JWT in Authorization Header",
			setupRequest: func() *http.Request {
				token, _, _ := GenerateJWT("testuser")
				req := httptest.NewRequest("GET", "/", nil)
				req.Header.Set("Authorization", "Bearer "+token)
				return req
			},
			expectedStatus: http.StatusOK,
			expectedUser:   "testuser",
		},
		{
			name: "Missing JWT",
			setupRequest: func() *http.Request {
				return httptest.NewRequest("GET", "/", nil)
			},
			expectedStatus: http.StatusUnauthorized,
			expectedUser:   "",
		},
		{
			name: "Invalid JWT",
			setupRequest: func() *http.Request {
				req := httptest.NewRequest("GET", "/", nil)
				req.AddCookie(&http.Cookie{
					Name:  "markbyte_login_token",
					Value: "invalid.token.here",
				})
				return req
			},
			expectedStatus: http.StatusUnauthorized,
			expectedUser:   "",
		},
		{
			name: "Expired JWT",
			setupRequest: func() *http.Request {
				token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
					"username": "testuser",
					"exp":      time.Now().Add(-1 * time.Hour).Unix(),
				})
				tokenStr, _ := token.SignedString(jwtSecret)
				req := httptest.NewRequest("GET", "/", nil)
				req.AddCookie(&http.Cookie{
					Name:  "markbyte_login_token",
					Value: tokenStr,
				})
				return req
			},
			expectedStatus: http.StatusUnauthorized,
			expectedUser:   "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Create a test handler that will be wrapped by the middleware
			testHandler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				// If we expect a valid user, verify it's in the context
				if tt.expectedUser != "" {
					username := r.Context().Value(UsernameKey).(string)
					assert.Equal(t, tt.expectedUser, username)
				}
				w.WriteHeader(http.StatusOK)
			})

			// Wrap the test handler with our middleware
			handler := JWTAuthMiddleware(testHandler)

			// Create a response recorder
			w := httptest.NewRecorder()

			// Call the handler
			handler.ServeHTTP(w, tt.setupRequest())

			// Check the status code
			assert.Equal(t, tt.expectedStatus, w.Code)
		})
	}
}
