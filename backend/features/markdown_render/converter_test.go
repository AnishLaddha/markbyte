package markdown_render

import (
	"bytes"
	"fmt"
	"regexp"
	"strings"

	"github.com/yuin/goldmark"
	"github.com/yuin/goldmark/extension"
	"github.com/yuin/goldmark/parser"
	gmhtml "github.com/yuin/goldmark/renderer/html"

	// Import syntax highlighting
	chromahtml "github.com/alecthomas/chroma/v2/formatters/html"
	highlighting "github.com/yuin/goldmark-highlighting/v2"
)

// ConvertMarkdown converts markdown content to HTML
func ConvertMarkdown(mdContent []byte) (string, error) {
	var buf bytes.Buffer

	// Initialize goldmark with extensions
	md := goldmark.New(
		goldmark.WithExtensions(
			extension.GFM,
			extension.Table,
			extension.Strikethrough,
			extension.TaskList,
			extension.Typographer,
			extension.Footnote,
			extension.DefinitionList,
			highlighting.NewHighlighting(
				highlighting.WithStyle("dracula"),
				highlighting.WithFormatOptions(
					chromahtml.WithLineNumbers(true),
				),
			),
		),
		goldmark.WithParserOptions(
			parser.WithAutoHeadingID(),
		),
		goldmark.WithRendererOptions(
			gmhtml.WithUnsafe(),
		),
	)

	// Remove any script tags for security
	re := regexp.MustCompile(`<script.*?>.*?</script>`)
	mdContent = re.ReplaceAll(mdContent, []byte(""))

	// Convert markdown to HTML
	if err := md.Convert(mdContent, &buf); err != nil {
		fmt.Println("Error converting Markdown:", err)
		return "", err
	}

	return buf.String(), nil
}

// InsertTemplate inserts the converted HTML into a template based on the style
func InsertTemplate(outputHTML string, templateName string, username string) string {
	if templateName == "old" {
		outputHTML = strings.ReplaceAll(oldTemplate, "CONTENT", outputHTML)
		fmt.Println("old template")
	} else if templateName == "futuristic" {
		outputHTML = strings.ReplaceAll(futuristicTemplate, "CONTENT", outputHTML)
		outputHTML = strings.ReplaceAll(outputHTML, "USERNAME", username)
		fmt.Println("futuristic template")
	} else {
		outputHTML = strings.ReplaceAll(defaultTemplate, "CONTENT", outputHTML)
		fmt.Println("default template")
	}
	return outputHTML
}
