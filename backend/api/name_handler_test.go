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

func TestHandleUpdateUserName(t *testing.T) {
	userDB = &mockUserDB{}
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
			body:         `{"name":"New Name"}`,
			expectedCode: http.StatusOK,
			expectedBody: "",
		},
		{
			name:         "unauthorized",
			username:     "",
			body:         `{"name":"New Name"}`,
			expectedCode: http.StatusUnauthorized,
			expectedBody: "Unauthorized",
		},
		{
			name:         "bad json",
			username:     "testuser",
			body:         `{"name":}`,
			expectedCode: http.StatusBadRequest,
			expectedBody: "Failed to decode request",
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
			HandleUpdateUserName(rr, req)
			assert.Equal(t, tt.expectedCode, rr.Code)
			if tt.expectedBody != "" {
				assert.Contains(t, rr.Body.String(), tt.expectedBody)
			}
		})
	}
}
