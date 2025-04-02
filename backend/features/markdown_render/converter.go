package markdown_render

import (
	"bytes"
	"fmt"
	"regexp"

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

	// insert converted html into template
	// outputHTML := strings.Replace(string(templateHTML), "{{CONTENT}}", buf.String(), 1)

	return buf.String(), nil
}
