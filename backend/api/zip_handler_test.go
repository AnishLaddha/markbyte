package api

import (
	"archive/zip"
	"bytes"
	"context"
	"io"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/shrijan-swaminathan/markbyte/backend/auth"
	"github.com/stretchr/testify/assert"
)

func TestHandleZipUpload(t *testing.T) {
	origLoadCredentials := LoadCredentials
	origUploadHTMLFile := UploadHTMLFile
	origUploadMDFile := UploadMDFile
	origUploadImages := UploadImages
	LoadCredentials = func() (S3Credentials, error) { return S3Credentials{}, nil }
	UploadHTMLFile = func(ctx context.Context, html, key string, cred S3Credentials) (string, error) {
		return "https://s3.mock/zip.html", nil
	}
	UploadMDFile = func(ctx context.Context, md, key string, cred S3Credentials) (string, error) {
		return "https://s3.mock/zip.md", nil
	}
	UploadImages = func(ctx context.Context, images map[string][]byte, cred S3Credentials) (map[string]string, error) {
		return map[string]string{}, nil
	}
	defer func() {
		LoadCredentials = origLoadCredentials
		UploadHTMLFile = origUploadHTMLFile
		UploadMDFile = origUploadMDFile
		UploadImages = origUploadImages
	}()

	blogPostDataDB = &mockBlogPostDataDB{}
	AnalyticsDataDB = &mockAnalyticsDataDB{}

	// Create a zip file in memory with a single test.md file
	var buf bytes.Buffer
	zipWriter := multipart.NewWriter(&buf)
	fw, _ := zipWriter.CreateFormFile("zipfile", "test.zip")
	// Write a dummy zip file containing a .md file
	zipBuf := new(bytes.Buffer)
	zipW := NewTestZipWriter(zipBuf)
	zipW.AddFile("test.md", "# Hello\nTest")
	zipW.Close()
	io.Copy(fw, zipBuf)
	zipWriter.Close()

	req := httptest.NewRequest("POST", "/zipupload", &buf)
	req.Header.Set("Content-Type", zipWriter.FormDataContentType())
	ctx := context.WithValue(req.Context(), auth.UsernameKey, "testuser")
	req = req.WithContext(ctx)
	rr := httptest.NewRecorder()

	HandleZipUpload(rr, req)

	assert.Equal(t, http.StatusOK, rr.Code)
}

// Helper for zip creation in tests
type TestZipWriter struct {
	writer *zip.Writer
}

func NewTestZipWriter(buf *bytes.Buffer) *TestZipWriter {
	return &TestZipWriter{writer: zip.NewWriter(buf)}
}

func (z *TestZipWriter) AddFile(name, content string) {
	f, _ := z.writer.Create(name)
	f.Write([]byte(content))
}

func (z *TestZipWriter) Close() {
	z.writer.Close()
}
