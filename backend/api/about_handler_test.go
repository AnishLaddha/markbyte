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

func TestHandleAboutPageUpload(t *testing.T) {
	origLoadCredentials := LoadCredentials
	origUploadHTMLFile := UploadHTMLFile
	origUploadMDFile := UploadMDFile
	LoadCredentials = func() (S3Credentials, error) { return S3Credentials{}, nil }
	UploadHTMLFile = func(ctx context.Context, html, key string, cred S3Credentials) (string, error) {
		return "https://s3.mock/about.html", nil
	}
	UploadMDFile = func(ctx context.Context, md, key string, cred S3Credentials) (string, error) {
		return "https://s3.mock/about.md", nil
	}
	defer func() {
		LoadCredentials = origLoadCredentials
		UploadHTMLFile = origUploadHTMLFile
		UploadMDFile = origUploadMDFile
	}()

	userDB = &mockUserDB{}

	var b bytes.Buffer
	wr := multipart.NewWriter(&b)
	fw, _ := wr.CreateFormFile("about_file", "about.md")
	if _, err := io.Copy(fw, strings.NewReader("# About Me\nThis is a test.")); err != nil {
		t.Fatalf("io.Copy failed: %v", err)
	}
	wr.Close()

	req := httptest.NewRequest("POST", "/about/upload", &b)
	req.Header.Set("Content-Type", wr.FormDataContentType())
	ctx := context.WithValue(req.Context(), auth.UsernameKey, "testuser")
	req = req.WithContext(ctx)
	rr := httptest.NewRecorder()

	HandleAboutPageUpload(rr, req)

	assert.Equal(t, http.StatusOK, rr.Code)
	assert.Contains(t, rr.Body.String(), "https://s3.mock/about.html")
	assert.Contains(t, rr.Body.String(), "https://s3.mock/about.md")
}

func TestHandleAboutPageGet(t *testing.T) {
	origLoadCredentials := LoadCredentials
	origReadFilefromS3 := ReadFilefromS3
	LoadCredentials = func() (S3Credentials, error) { return S3Credentials{}, nil }
	ReadFilefromS3 = func(ctx context.Context, key string, cred S3Credentials) (string, error) {
		return "<html>About Content</html>", nil
	}
	defer func() {
		LoadCredentials = origLoadCredentials
		ReadFilefromS3 = origReadFilefromS3
	}()

	userDB = &mockUserDB{}

	body := `{"username":"testuser"}`
	req := httptest.NewRequest("POST", "/about/get", strings.NewReader(body))
	rr := httptest.NewRecorder()

	HandleAboutPageGet(rr, req)

	assert.Equal(t, http.StatusOK, rr.Code)
	assert.Contains(t, rr.Body.String(), "About Content")
}
