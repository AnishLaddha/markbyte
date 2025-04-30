package api

import (
	"bytes"
	"context"
	"io"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/shrijan-swaminathan/markbyte/backend/auth"
	"github.com/stretchr/testify/assert"
)

func TestHandleUpdateUserProfilePicture(t *testing.T) {
	origLoadCredentials := LoadCredentials
	origUploadImages := UploadImages
	LoadCredentials = func() (S3Credentials, error) { return S3Credentials{}, nil }
	UploadImages = func(ctx context.Context, images map[string][]byte, cred S3Credentials) (map[string]string, error) {
		return map[string]string{"profile_pictures/testuser.png": "https://s3.mock/pfp.png"}, nil
	}
	defer func() {
		LoadCredentials = origLoadCredentials
		UploadImages = origUploadImages
	}()

	userDB = &mockUserDB{}

	var b bytes.Buffer
	wr := multipart.NewWriter(&b)
	fw, _ := wr.CreateFormFile("profile_picture", "testuser.png")
	io.Copy(fw, strings.NewReader("fakeimagebytes"))
	wr.Close()

	req := httptest.NewRequest("POST", "/pfp", &b)
	req.Header.Set("Content-Type", wr.FormDataContentType())
	ctx := context.WithValue(req.Context(), auth.UsernameKey, "testuser")
	req = req.WithContext(ctx)
	rr := httptest.NewRecorder()

	HandleUpdateUserProfilePicture(rr, req)

	assert.Equal(t, http.StatusOK, rr.Code)
	assert.Contains(t, rr.Body.String(), "https://s3.mock/pfp.png")
}
