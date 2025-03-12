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

// const templateHTML = `
// <!DOCTYPE html>
// <html lang="en">
// <head>
//     <meta charset="UTF-8">
//     <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     <title>Markdown Render</title>
//     <script src="https://cdn.tailwindcss.com"></script>
//     <link rel="preconnect" href="https://fonts.googleapis.com">
//     <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
//     <link href="https://fonts.googleapis.com/css2?family=PT+Serif:wght@400;700&display=swap" rel="stylesheet">
//     <script>
//         tailwind.config = {
//             theme: {
//                 extend: {
//                     colors: {
//                         black: "#000000",
//                         white: "#ffffff",
//                         grayDark: "#121212",
//                         grayDarker: "#181818",
//                         blueAccent: "#2563eb",
//                         grayLight: "#f8f9fa"
//                     },
//                     fontFamily: {
//                         serif: ['PT Serif', 'serif']
//                     }
//                 }
//             }
//         };

//         document.addEventListener("DOMContentLoaded", function() {
//             // Load Dark Mode Setting
//             if (localStorage.getItem("dark-mode") === "enabled" ||
//                 (localStorage.getItem("dark-mode") === null && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
//                 document.documentElement.classList.add("dark");
//             }

//             // Dark Mode Toggle Button
//             const darkModeToggle = document.createElement("button");
//             darkModeToggle.innerText = "Toggle Dark Mode";
//             darkModeToggle.classList.add("fixed", "top-4", "right-4", "bg-gray-700", "text-white", "px-4", "py-2", "rounded-md", "shadow-md", "hover:bg-gray-600");
//             document.body.appendChild(darkModeToggle);

//             darkModeToggle.addEventListener("click", function() {
//                 document.documentElement.classList.toggle("dark");
//                 localStorage.setItem("dark-mode", document.documentElement.classList.contains("dark") ? "enabled" : "disabled");
//             });

//             // Generate Table of Contents dynamically
//             const tocContainer = document.getElementById("toc");
//             const content = document.querySelector(".content-container");
//             const headers = content.querySelectorAll("h1, h2, h3");

//             headers.forEach(header => {
//                 const id = header.innerText.toLowerCase().replace(/[^a-z0-9]+/g, "-");
//                 header.id = id; // Ensure the header has an ID for linking

//                 const link = document.createElement("a");
//                 link.href = "#" + id;
//                 link.innerText = header.innerText;
//                 link.classList.add("block", "text-black", "dark:text-white", "hover:text-gray-700", "dark:hover:text-gray-300", "py-1");

//                 // Indent based on header level
//                 if (header.tagName === "H2") link.classList.add("pl-4");
//                 if (header.tagName === "H3") link.classList.add("pl-8");

//                 tocContainer.appendChild(link);
//             });
//         });
//     </script>
//     <style>
//         @import url('https://cdn.jsdelivr.net/npm/@tailwindcss/typography@0.5.0/dist/typography.min.css');
//         @import url('https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/dracula.min.css');

//         /* Global Styling */
//         body {
//             transition: background-color 0.3s, color 0.3s;
//             font-family: 'PT Serif', serif;
//         }

//         /* Light Mode */
//         body {
//             background-color: #ffffff;
//             color: #000000;
//         }

//         /* Dark Mode */
//         .dark body {
//             background-color: #000000;
//             color: #ffffff;
//         }

//         /* Sidebar */
// 		.sidebar {
// 			width: 250px;
// 			background: #f8f9fa; /* Light mode sidebar */
// 			padding: 1.5rem;
// 			position: fixed;
// 			left: 20px; /* Move it slightly away from the left */
// 			top: 20px;
// 			height: auto;
// 			max-height: 80vh; /* Prevent it from taking the full height */
// 			overflow-y: auto;
// 			border-radius: 12px; /* Rounded corners */
// 			box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2); /* Floating effect */
// 			transition: transform 0.3s ease-in-out;
// 		}

// 		.dark .sidebar {
// 			background: #121212;
// 			border-right: none;
// 			box-shadow: 0 4px 10px rgba(255, 255, 255, 0.1);
// 		}

// 		@media (max-width: 768px) {
// 			.sidebar {
// 				display: none;
// 			}
// 			.content-container {
// 				margin-left: 0 !important;
// 				padding: 1rem; /* Adjust padding for better spacing */
// 			}
// 		}

//         .sidebar h2 {
//             font-size: 1.2rem;
//             font-weight: bold;
//             margin-bottom: 1rem;
//             color: #333;
//         }

//         .dark .sidebar h2 {
//             color: #e5e7eb;
//         }

//         /* Main Content */
//         .content-container {
//             max-width: 900px;
//             margin: auto;
//             padding: 2rem;
//             margin-left: 260px;
// 			transition: margin-left 0.3s ease-in-out;
//         }

// 		.sidebar a {
// 			text-decoration: none !important;
// 		}

//         /* Typography */
//         .prose {
//             max-width: none;
//             color: black;
//             background: transparent;
//         }

//         .dark .prose {
//             color: white;
//         }

//         /* Headers */
//         h1, h2, h3, h4, h5, h6 {
//             color: black;
//         }

//         .dark h1, .dark h2, .dark h3, .dark h4, .dark h5, .dark h6 {
//             color: white;
//         }

//         blockquote {
//             border-left: 4px solid #2563eb;
//             padding-left: 1rem;
//             font-style: italic;
//             color: #555;
//         }

//         .dark blockquote {
//             color: #ddd;
//         }

//         strong, b {
//             color: black;
//             font-weight: bold;
//         }

//         .dark strong, .dark b {
//             color: white !important;
//         }

//         a {
//             color: black;
//             text-decoration: underline;
//         }

//         .dark a {
//             color: white !important;
//             text-decoration: underline;
//         }

//         /* **🔹 FIX FOR TABLES** */
//         table {
//             width: 100%;
//             border-collapse: collapse;
//             background: white;
//             color: black;
//         }

//         .dark table {
//             background: #111;
//             color: white;
//         }

//         th {
//             background: #f2f2f2;
//             color: black;
//             padding: 10px;
//             text-align: left;
//             font-weight: bold;
//         }

//         .dark th {
//             background: #222;
//             color: white !important;
//         }

//         td {
//             padding: 10px;
//             border: 1px solid #ddd;
//         }

//         .dark td {
//             border: 1px solid #444;
//         }

//         /* Code Blocks */
//         pre {
//             padding: 1rem;
//             border-radius: 6px;
//             overflow-x: auto;
//             background-color: #f3f3f3;
//         }

//         .dark pre {
//             background-color: #1e1e1e !important;
//         }

//         /* Inline Code */
//         code {
//             background: #f3f3f3;
//             padding: 2px 6px;
//             border-radius: 4px;
//             color: #d63384;
//         }

//         .dark code {
//             background: #222;
//             color: #ffcc99;
//         }

// 		.prose table {
//     		margin-left: 1rem !important; /* Slight left indent */
// 		}

// 		th, td {
// 			font-family: sans-serif !important;
// 			padding: 10px !important;
// 		}
//     </style>
// </head>
// <body>
//     <!-- Sidebar -->
//     <nav class="sidebar">
//         <h2>Navigation</h2>
//         <div id="toc"></div>
//     </nav>

//     <!-- Main Content -->
//     <div class="content-container">
//         <article class="prose">
//             {{CONTENT}}
//         </article>
//     </div>
// </body>
// </html>
// `

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
