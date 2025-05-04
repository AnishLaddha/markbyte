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

func ConvertMarkdown(mdContent []byte) (string, error) {
	var buf bytes.Buffer

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
				highlighting.WithFormatOptions(chromahtml.WithLineNumbers(true)),
			),
		),
		goldmark.WithParserOptions(
			parser.WithAutoHeadingID(),
		),
		goldmark.WithRendererOptions(
			gmhtml.WithUnsafe(),
		),
	)

	re := regexp.MustCompile(`(?is)<script.*?</script>`)
	mdContent = re.ReplaceAll(mdContent, []byte(""))

	// convert markdown to html
	if err := md.Convert(mdContent, &buf); err != nil {
		fmt.Println("Error converting Markdown:", err)
		return "", err
	}
	html := addTargetBlank(buf.String())

	return html, nil
}

func addTargetBlank(html string) string {
	re := regexp.MustCompile(`<a\s+[^>]*>`)
	return re.ReplaceAllStringFunc(html, func(tag string) string {
		// If target already exists, don't touch
		if strings.Contains(tag, "target=") {
			return tag
		}
		// Otherwise, inject target="_blank"
		return strings.Replace(tag, "<a", `<a target="_blank"`, 1)
	})
}
