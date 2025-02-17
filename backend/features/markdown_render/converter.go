package markdown_render

import (
	"bytes"
	"fmt"
	"strings"

	"github.com/yuin/goldmark"
	"github.com/yuin/goldmark/extension"
	"github.com/yuin/goldmark/parser"
	gmhtml "github.com/yuin/goldmark/renderer/html"

	// Import syntax highlighting
	chromahtml "github.com/alecthomas/chroma/v2/formatters/html"
	highlighting "github.com/yuin/goldmark-highlighting/v2"
)

const templateHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markdown Render</title>
    <link rel="stylesheet" href="https://markbyteblogfiles.s3.us-east-1.amazonaws.com/styles.css">
</head>
<script>
    document.addEventListener("DOMContentLoaded", function() {
        const darkModeToggle = document.createElement("button");
        darkModeToggle.innerText = "Toggle Dark Mode";
        darkModeToggle.classList.add("dark-mode-toggle");
        document.body.appendChild(darkModeToggle);
    
        if (localStorage.getItem("dark-mode") === "enabled") {
            document.body.classList.add("dark-mode");
        }
    
        darkModeToggle.addEventListener("click", function() {
            document.body.classList.toggle("dark-mode");
            localStorage.setItem("dark-mode", document.body.classList.contains("dark-mode") ? "enabled" : "disabled");
        });
    });
</script>
    
<body>
    <div class="content">
        {{CONTENT}}
    </div>
</body>
</html>
`

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

	// convert markdown to html
	if err := md.Convert(mdContent, &buf); err != nil {
		fmt.Println("Error converting Markdown:", err)
		return "", err
	}

	// insert converted html into template
	outputHTML := strings.Replace(string(templateHTML), "{{CONTENT}}", buf.String(), 1)

	return outputHTML, nil
}
