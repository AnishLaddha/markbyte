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

func TestHandleGithubUpload_Unauthorized(t *testing.T) {
	req := httptest.NewRequest("POST", "/githubupload", nil)
	rr := httptest.NewRecorder()
	HandleGithubUpload(rr, req)
	assert.Equal(t, http.StatusUnauthorized, rr.Code)
}

func TestHandleGithubUpload_BadRequest(t *testing.T) {
	body := `{"owner":"","repo_name":"","branch":""}`
	req := httptest.NewRequest("POST", "/githubupload", strings.NewReader(body))
	ctx := context.WithValue(req.Context(), auth.UsernameKey, "testuser")
	req = req.WithContext(ctx)
	rr := httptest.NewRecorder()
	HandleGithubUpload(rr, req)
	assert.Equal(t, http.StatusBadRequest, rr.Code)
}
