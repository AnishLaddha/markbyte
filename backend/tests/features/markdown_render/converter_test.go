package features_mdconverter_test

import (
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/shrijan-swaminathan/markbyte/backend/features/markdown_render"
	"github.com/stretchr/testify/assert"
)

// TestConvertMarkdown verifies that the ConvertMarkdown function correctly converts Markdown to HTML.
func TestConvertMarkdown(t *testing.T) {
	// Load Markdown content from a sample file
	mdContent, err := os.ReadFile(filepath.Join("test_files", "markdowns", "md_example.md"))
	assert.NoError(t, err, "Failed to read markdown file")

	// Call ConvertMarkdown to convert the Markdown to HTML
	htmlContent, err := markdown_render.ConvertMarkdown(mdContent)
	assert.NoError(t, err, "ConvertMarkdown returned an error")

	// Validate that the output is not empty and contains HTML tags
	assert.NotEmpty(t, htmlContent, "HTML content should not be empty")
	assert.True(t, strings.Contains(htmlContent, "<html"), "HTML content should contain HTML tags")
}

// TestConvertMarkdownWithInvalidInput ensures that ConvertMarkdown handles invalid Markdown input.
func TestConvertMarkdownWithInvalidInput(t *testing.T) {
	// Call ConvertMarkdown with invalid Markdown content
	htmlContent, err := markdown_render.ConvertMarkdown([]byte("This is some invalid markdown"))
	assert.NoError(t, err, "ConvertMarkdown should not return an error for invalid input")

	// Validate that the output is not empty and contains HTML tags
	assert.NotEmpty(t, htmlContent, "HTML content should not be empty")
	assert.True(t, strings.Contains(htmlContent, "<html"), "HTML content should contain HTML tags")
}