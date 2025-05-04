package markdown_render

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestConvertMarkdown_Basic(t *testing.T) {
	md := []byte("# Hello\nThis is *markdown*.")
	html, err := ConvertMarkdown(md)
	assert.NoError(t, err)
	assert.Contains(t, html, "<h1")
	assert.Contains(t, html, "Hello")
	assert.Contains(t, html, "<em>markdown</em>")
}

func TestConvertMarkdown_Empty(t *testing.T) {
	html, err := ConvertMarkdown([]byte(""))
	assert.NoError(t, err)
	assert.NotNil(t, html)
}

func TestInsertTemplate_Basic(t *testing.T) {
	html := "<h1>Hello</h1>"
	style := "default"
	username := "testuser"
	name := "Test User"
	date := "01/01/2025"

	InsertTemplate(&html, style, username, name, date)
	assert.Contains(t, html, "Hello")
}

func TestInsertTemplate_CustomStyle(t *testing.T) {
	html := "<h1>Custom</h1>"
	style := "fancy"
	username := "alice"
	name := "Alice"
	date := "02/02/2025"

	InsertTemplate(&html, style, username, name, date)
	assert.Contains(t, html, "Custom")
}
