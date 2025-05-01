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
	if _, err := f.Write([]byte("# Hello\nTest")); err != nil {
		t.Fatalf("f.Write failed: %v", err)
	}
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
	if _, err := f.Write([]byte("fakeimage")); err != nil {
		t.Fatalf("f.Write failed: %v", err)
	}
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
	if _, err := f.Write([]byte("# A")); err != nil {
		t.Fatalf("f.Write failed: %v", err)
	}
	f2, _ := zipWriter.Create("b.md")
	if _, err := f2.Write([]byte("# B")); err != nil {
		t.Fatalf("f.Write failed: %v", err)
	}
	zipWriter.Close()

	_, err := extractZip(context.Background(), zipBuf.Bytes(), cred, username)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "multiple markdown files found")
}
