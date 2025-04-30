package api

import (
	"archive/zip"
	"bytes"
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestExtractZip_SingleMarkdown(t *testing.T) {
	origUploadImages := UploadImages
	UploadImages = func(ctx context.Context, images map[string][]byte, cred S3Credentials) (map[string]string, error) {
		return map[string]string{}, nil
	}
	defer func() { UploadImages = origUploadImages }()

	cred := S3Credentials{}
	username := "testuser"

	// Create an in-memory ZIP with a single .md file
	var zipBuf bytes.Buffer
	zipWriter := zip.NewWriter(&zipBuf)
	f, _ := zipWriter.Create("test.md")
	f.Write([]byte("# Hello\nTest"))
	zipWriter.Close()

	zipData, err := extractZip(context.Background(), zipBuf.Bytes(), cred, username)
	assert.NoError(t, err)
	assert.Equal(t, "test", zipData.post_name)
	assert.Contains(t, string(zipData.md_content), "Hello")
	assert.Contains(t, zipData.html_content, "<h1")
}

func TestExtractZip_NoMarkdown(t *testing.T) {
	cred := S3Credentials{}
	username := "testuser"

	var zipBuf bytes.Buffer
	zipWriter := zip.NewWriter(&zipBuf)
	f, _ := zipWriter.Create("image.png")
	f.Write([]byte("fakeimage"))
	zipWriter.Close()

	_, err := extractZip(context.Background(), zipBuf.Bytes(), cred, username)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "no markdown file found")
}

func TestExtractZip_MultipleMarkdown(t *testing.T) {
	cred := S3Credentials{}
	username := "testuser"

	var zipBuf bytes.Buffer
	zipWriter := zip.NewWriter(&zipBuf)
	f, _ := zipWriter.Create("a.md")
	f.Write([]byte("# A"))
	f2, _ := zipWriter.Create("b.md")
	f2.Write([]byte("# B"))
	zipWriter.Close()

	_, err := extractZip(context.Background(), zipBuf.Bytes(), cred, username)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "multiple markdown files found")
}
