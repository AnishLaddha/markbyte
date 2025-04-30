package api

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/shrijan-swaminathan/markbyte/backend/auth"
	"github.com/stretchr/testify/assert"
)

func TestHandleFetchAllBlogPosts(t *testing.T) {
	blogPostDataDB = &mockBlogPostDataDB{}
	tests := []struct {
		name         string
		username     string
		expectedCode int
	}{
		{
			name:         "authorized",
			username:     "testuser",
			expectedCode: http.StatusOK,
		},
		{
			name:         "unauthorized",
			username:     "",
			expectedCode: http.StatusUnauthorized,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest("GET", "/", nil)
			ctx := req.Context()
			if tt.username != "" {
				ctx = context.WithValue(ctx, auth.UsernameKey, tt.username)
			}
			req = req.WithContext(ctx)
			rr := httptest.NewRecorder()
			HandleFetchAllBlogPosts(rr, req)
			assert.Equal(t, tt.expectedCode, rr.Code)
			if tt.expectedCode == http.StatusOK {
				var blogs []interface{}
				err := json.Unmarshal(rr.Body.Bytes(), &blogs)
				assert.NoError(t, err)
			} else {
				assert.Contains(t, rr.Body.String(), "Unauthorized")
			}
		})
	}
}

func TestHandlePublishPostVersion(t *testing.T) {
	blogPostDataDB = &mockBlogPostDataDB{}
	tests := []struct {
		name         string
		username     string
		body         string
		expectedCode int
		expectedBody string
	}{
		{
			name:         "authorized, valid",
			username:     "testuser",
			body:         `{"username":"testuser","title":"Test Title","version":"1"}`,
			expectedCode: http.StatusOK,
			expectedBody: "",
		},
		{
			name:         "unauthorized",
			username:     "",
			body:         `{"username":"testuser","title":"Test Title","version":"1"}`,
			expectedCode: http.StatusUnauthorized,
			expectedBody: "Unauthorized",
		},
		{
			name:         "username mismatch",
			username:     "testuser",
			body:         `{"username":"otheruser","title":"Test Title","version":"1"}`,
			expectedCode: http.StatusUnauthorized,
			expectedBody: "Unauthorized",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := httptest.NewRequest("POST", "/", strings.NewReader(tt.body))
			ctx := req.Context()
			if tt.username != "" {
				ctx = context.WithValue(ctx, auth.UsernameKey, tt.username)
			}
			req = req.WithContext(ctx)
			rr := httptest.NewRecorder()
			HandlePublishPostVersion(rr, req)
			assert.Equal(t, tt.expectedCode, rr.Code)
			if tt.expectedBody != "" {
				assert.Contains(t, rr.Body.String(), tt.expectedBody)
			}
		})
	}
}
