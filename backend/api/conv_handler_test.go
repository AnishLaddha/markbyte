package api

import (
	"bytes"
	"context"
	"io"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"

	"github.com/shrijan-swaminathan/markbyte/backend/auth"
	"github.com/stretchr/testify/assert"
)

func TestHandleUpload(t *testing.T) {
	origLoadCredentials := LoadCredentials
	origUploadHTMLFile := UploadHTMLFile
	origUploadMDFile := UploadMDFile
	LoadCredentials = func() (S3Credentials, error) { return S3Credentials{}, nil }
	UploadHTMLFile = func(ctx context.Context, html, key string, cred S3Credentials) (string, error) {
		return "https://s3.mock/blog.html", nil
	}
	UploadMDFile = func(ctx context.Context, md, key string, cred S3Credentials) (string, error) {
		return "https://s3.mock/blog.md", nil
	}
	defer func() {
		LoadCredentials = origLoadCredentials
		UploadHTMLFile = origUploadHTMLFile
		UploadMDFile = origUploadMDFile
	}()

	blogPostDataDB = &mockBlogPostDataDB{}
	AnalyticsDataDB = &mockAnalyticsDataDB{}

	var b bytes.Buffer
	wr := multipart.NewWriter(&b)
	fw, _ := wr.CreateFormFile("file", "test.md")
	if _, err := io.Copy(fw, strings.NewReader("# Hello\nTest")); err != nil {
		t.Fatalf("io.Copy failed: %v", err)
	}
	if err := wr.WriteField("title", "Test Title"); err != nil {
		t.Fatalf("wr.WriteField failed: %v", err)
	}
	wr.Close()

	req := httptest.NewRequest("POST", "/upload", &b)
	req.Header.Set("Content-Type", wr.FormDataContentType())
	ctx := context.WithValue(req.Context(), auth.UsernameKey, "testuser")
	req = req.WithContext(ctx)
	rr := httptest.NewRecorder()

	HandleUpload(rr, req)

	assert.Equal(t, http.StatusOK, rr.Code)
	assert.Contains(t, rr.Body.String(), "File processed successfully")
	// clean up
	if err := os.RemoveAll("cmd/"); err != nil {
		t.Fatalf("Failed to remove file: %v", err)
	}
}

func TestHandleDelete(t *testing.T) {
	origLoadCredentials := LoadCredentials
	origDeleteFile := DeleteFile
	LoadCredentials = func() (S3Credentials, error) { return S3Credentials{}, nil }
	DeleteFile = func(ctx context.Context, key string, cred S3Credentials) error { return nil }
	defer func() {
		LoadCredentials = origLoadCredentials
		DeleteFile = origDeleteFile
	}()

	blogPostDataDB = &mockBlogPostDataDB{}
	AnalyticsDataDB = &mockAnalyticsDataDB{}

	body := `{"title":"Test Title"}`
	req := httptest.NewRequest("POST", "/delete", strings.NewReader(body))
	ctx := context.WithValue(req.Context(), auth.UsernameKey, "testuser")
	req = req.WithContext(ctx)
	rr := httptest.NewRecorder()

	HandleDelete(rr, req)

	assert.Equal(t, http.StatusOK, rr.Code)
	assert.Contains(t, rr.Body.String(), "Post deleted successfully")
}
