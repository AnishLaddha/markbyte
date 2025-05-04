package api

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/shrijan-swaminathan/markbyte/backend/auth"
	"github.com/stretchr/testify/assert"
)

func TestHandleFetchUserStyle(t *testing.T) {
	userDB = &mockUserDB{}
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
			expectedBody: "default",
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
			req := httptest.NewRequest("GET", "/", nil)
			ctx := req.Context()
			if tt.username != "" {
				ctx = context.WithValue(ctx, auth.UsernameKey, tt.username)
			}
			req = req.WithContext(ctx)
			rr := httptest.NewRecorder()
			HandleFetchUserStyle(rr, req)
			assert.Equal(t, tt.expectedCode, rr.Code)
			assert.Contains(t, rr.Body.String(), tt.expectedBody)
		})
	}
}
