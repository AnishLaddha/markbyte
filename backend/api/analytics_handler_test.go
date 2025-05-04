package api

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/shrijan-swaminathan/markbyte/backend/auth"
	"github.com/stretchr/testify/assert"
)

func TestHandleGetPostAnalytics(t *testing.T) {
	AnalyticsDataDB = &mockAnalyticsDataDB{}
	tests := []struct {
		name         string
		username     string
		body         string
		expectedCode int
	}{
		{
			name:         "authorized",
			username:     "testuser",
			body:         `{"title":"Test Title","version":"1"}`,
			expectedCode: http.StatusOK,
		},
		{
			name:         "unauthorized",
			username:     "",
			body:         `{"title":"Test Title","version":"1"}`,
			expectedCode: http.StatusUnauthorized,
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
			HandleGetPostAnalytics(rr, req)
			assert.Equal(t, tt.expectedCode, rr.Code)
		})
	}
}
func TestHandleLikePost(t *testing.T) {
	blogPostDataDB = &mockBlogPostDataDB{}
	userDB = &mockUserDB{}
	AnalyticsDataDB = &mockAnalyticsDataDB{}

	tests := []struct {
		name         string
		username     string
		body         string
		expectedCode int
	}{
		{
			name:         "authorized",
			username:     "testuser",
			body:         `{"post_username":"testuser","title":"Test Title","version":"1"}`,
			expectedCode: http.StatusOK,
		},
		{
			name:         "unauthorized",
			username:     "",
			body:         `{"post_username":"testuser","title":"Test Title","version":"1"}`,
			expectedCode: http.StatusUnauthorized,
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
			HandleLikePost(rr, req)
			assert.Equal(t, tt.expectedCode, rr.Code)
		})
	}
}

func TestHandleAllAnalytics(t *testing.T) {
	blogPostDataDB = &mockBlogPostDataDB{}
	userDB = &mockUserDB{}
	AnalyticsDataDB = &mockAnalyticsDataDB{}

	tests := []struct {
		name         string
		username     string
		expectedCode int
		expectedBody string
	}{
		{
			name:         "authorized",
			username:     "testuser",
			expectedCode: http.StatusOK,
			expectedBody: "", // You can add more specific checks if needed
		},
		{
			name:         "unauthorized",
			username:     "",
			expectedCode: http.StatusUnauthorized,
			expectedBody: "Unauthorized",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			blogPostDataDB = &mockBlogPostDataDB{}
			userDB = &mockUserDB{}
			AnalyticsDataDB = &mockAnalyticsDataDB{}

			req := httptest.NewRequest("GET", "/", nil)
			ctx := req.Context()
			if tt.username != "" {
				ctx = context.WithValue(ctx, auth.UsernameKey, tt.username)
			}
			req = req.WithContext(ctx)
			rr := httptest.NewRecorder()
			HandleAllAnalytics(rr, req)
			assert.Equal(t, tt.expectedCode, rr.Code)
			if tt.expectedBody != "" {
				assert.Contains(t, rr.Body.String(), tt.expectedBody)
			}
		})
	}
}
