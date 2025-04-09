package markdown_render

const default_template = `
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
    <nav class="sidebar">
        <h2>Table of Contents</h2>
        <div id="toc"></div>
    </nav>
    <div class="content-container">
        <article class="prose">
            {{CONTENT}}
        </article>
    </div>
</body>
</html>
`
const old_template = `
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

const futuristic_template = "" +
	"<!DOCTYPE html>\n" +
	"<html lang=\"en\">\n" +
	"<head>\n" +
	"    <meta charset=\"UTF-8\">\n" +
	"    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n" +
	"    <title>Futuristic Template</title>\n" +
	"    <link rel=\"preconnect\" href=\"https://fonts.googleapis.com\">\n" +
	"    <link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin>\n" +
	"    <link href=\"https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&family=Space+Mono:wght@400;700&display=swap\" rel=\"stylesheet\">\n" +
	"    <link rel=\"stylesheet\" href=\"https://markbyteblogfiles.s3.us-east-1.amazonaws.com/futuristic.css\">\n" +
	"</head>\n" +
	"<body>\n" +
	"    <div class=\"bg-grid\"></div>\n" +
	"    <div class=\"glow-circle green\"></div>\n" +
	"    <div class=\"glow-circle purple\"></div>\n" +
	"    <div class=\"glow-circle blue\"></div>\n" +
	"    \n" +
	"    <div class=\"container\">\n" +
	"        <div class=\"content-container\">\n" +
	"         {{CONTENT}}\n" +
	"        </div>\n" +
	"    </div>\n" +
	"    \n" +
	"    <script>\n" +
	"        document.addEventListener('DOMContentLoaded', () => {\n" +
	"            const codeBlocks = document.querySelectorAll('pre code');\n" +
	"            codeBlocks.forEach(block => {\n" +
	"                const lines = block.innerHTML.split('\\n');\n" +
	"                let formattedCode = '';\n" +
	"                lines.forEach((line, index) => {\n" +
	"                    formattedCode += `<span data-line=\"${index + 1}\">${line}</span>`;\n" +
	"                });\n" +
	"                block.innerHTML = formattedCode;\n" +
	"            });\n" +
	"            const headers = document.querySelectorAll('h1, h2, h3');\n" +
	"            headers.forEach((header, index) => {\n" +
	"                header.style.opacity = '0';\n" +
	"                header.style.transform = 'translateY(20px)';\n" +
	"                header.style.transition = 'opacity 0.6s ease, transform 0.6s ease';\n" +
	"                setTimeout(() => {\n" +
	"                    header.style.opacity = '1';\n" +
	"                    header.style.transform = 'translateY(0)';\n" +
	"                }, 300 + (index * 150));\n" +
	"            });\n" +
	"\n" +
	"            // Inject dynamic ::before content for h1\n" +
	"            const h1 = document.querySelector('h1');\n" +
	"            const labelText = '{{USERNAME}} 🚀'; // Change this to your desired label\n" +
	"            if (h1) {\n" +
	"                if (!h1.id) h1.id = 'dynamic-h1';\n" +
	"                const dynamicStyle = document.createElement('style');\n" +
	"                dynamicStyle.textContent = `#${h1.id}::before {\n" +
	"                    content: \"${labelText}\";\n" +
	"                    position: absolute;\n" +
	"                    right: 0;\n" +
	"                    top: 0;\n" +
	"                    font-size: 1rem;\n" +
	"                    color: var(--neon-green);\n" +
	"                    background: rgba(10, 255, 157, 0.1);\n" +
	"                    padding: 5px 10px;\n" +
	"                    border-radius: 5px;\n" +
	"                    font-weight: normal;\n" +
	"                }`;\n" +
	"                document.head.appendChild(dynamicStyle);\n" +
	"            }\n" +
	"\n" +
	"            function createDots() {\n" +
	"                const container = document.querySelector('.container');\n" +
	"                const dotCount = 15;\n" +
	"                for (let i = 0; i < dotCount; i++) {\n" +
	"                    const dot = document.createElement('div');\n" +
	"                    dot.style.position = 'absolute';\n" +
	"                    dot.style.width = `${Math.random() * 4 + 2}px`;\n" +
	"                    dot.style.height = dot.style.width;\n" +
	"                    dot.style.backgroundColor = 'var(--neon-green)';\n" +
	"                    dot.style.borderRadius = '50%';\n" +
	"                    dot.style.opacity = `${Math.random() * 0.3 + 0.1}`;\n" +
	"                    dot.style.left = `${Math.random() * 100}%`;\n" +
	"                    dot.style.top = `${Math.random() * 100}%`;\n" +
	"                    dot.style.animation = `pulse ${Math.random() * 3 + 2}s infinite alternate ease-in-out`;\n" +
	"                    container.appendChild(dot);\n" +
	"                }\n" +
	"            }\n" +
	"            const style = document.createElement('style');\n" +
	"            style.textContent = `@keyframes pulse {\n" +
	"                0% { transform: scale(1); opacity: 0.2; }\n" +
	"                100% { transform: scale(1.5); opacity: 0.5; }\n" +
	"            }`;\n" +
	"            document.head.appendChild(style);\n" +
	"            createDots();\n" +
	"        });\n" +
	"    </script>\n" +
	"</body>\n" +
	"</html>"
