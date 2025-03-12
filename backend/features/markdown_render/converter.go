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
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=PT+Serif:wght@400;700&display=swap" rel="stylesheet">
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        black: "#000000",
                        white: "#ffffff",
                        grayDark: "#121212",
                        grayDarker: "#181818",
                        blueAccent: "#2563eb",
                        grayLight: "#f8f9fa"
                    },
                    fontFamily: {
                        serif: ['PT Serif', 'serif']
                    }
                }
            }
        };

        document.addEventListener("DOMContentLoaded", function() {
            // Load Dark Mode Setting
            if (localStorage.getItem("dark-mode") === "enabled" ||
                (localStorage.getItem("dark-mode") === null && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add("dark");
            }

            // Dark Mode Toggle Button
            const darkModeToggle = document.createElement("button");
            darkModeToggle.innerText = "Toggle Dark Mode";
            darkModeToggle.classList.add("fixed", "top-4", "right-4", "bg-gray-700", "text-white", "px-4", "py-2", "rounded-md", "shadow-md", "hover:bg-gray-600");
            document.body.appendChild(darkModeToggle);

            darkModeToggle.addEventListener("click", function() {
                document.documentElement.classList.toggle("dark");
                localStorage.setItem("dark-mode", document.documentElement.classList.contains("dark") ? "enabled" : "disabled");
            });

            // Generate Table of Contents dynamically
            const tocContainer = document.getElementById("toc");
            const content = document.querySelector(".content-container");
            const headers = content.querySelectorAll("h1, h2, h3");

            headers.forEach(header => {
                const id = header.innerText.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                header.id = id; // Ensure the header has an ID for linking

                const link = document.createElement("a");
                link.href = "#" + id;
                link.innerText = header.innerText;
                link.classList.add("block", "text-black", "dark:text-white", "hover:text-gray-700", "dark:hover:text-gray-300", "py-1");

                // Indent based on header level
                if (header.tagName === "H2") link.classList.add("pl-4");
                if (header.tagName === "H3") link.classList.add("pl-8");

                tocContainer.appendChild(link);
            });
        });
    </script>
	<link rel="stylesheet" href="https://markbyteblogfiles.s3.us-east-1.amazonaws.com/styles2.css">
</head>
<body>
    <!-- Sidebar -->
    <nav class="sidebar">
        <h2>Table of Contents</h2>
        <div id="toc"></div>
    </nav>

    <!-- Main Content -->
    <div class="content-container">
        <article class="prose">
            {{CONTENT}}
        </article>
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
