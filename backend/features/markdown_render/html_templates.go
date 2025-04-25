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
            <div class="post-meta text-xs uppercase text-blueAccent dark:text-blue-400 mb-4">
                Posted by <a
                href="https://markbyte.xyz/{{USERNAME}}"
                target="_blank"
                class="font-semibold underline text-blueAccent dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 visited:text-inherit !text-blueAccent dark:!text-blue-400"
              >
                {{USERNAME}}
              </a> on {{DATE}}
            </div>
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
	"    <div id=\"date-banner\" style=\"\n" +
	"        position: absolute;\n" +
	"        top: 10px;\n" +
	"        right: 20px;\n" +
	"        font-size: 0.85rem;\n" +
	"        font-family: 'Space Mono', monospace;\n" +
	"        color: var(--neon-green);\n" +
	"        opacity: 0.7;\n" +
	"        z-index: 10;\n" +
	"    \">\n" +
	"        Date: {{DATE}}\n" +
	"    </div>\n" +
	"\n" +
	"    <div class=\"bg-grid\"></div>\n" +
	"    <div class=\"glow-circle green\"></div>\n" +
	"    <div class=\"glow-circle purple\"></div>\n" +
	"    <div class=\"glow-circle blue\"></div>\n" +
	"\n" +
	"    <div class=\"container\" style=\"padding: 20px 20px 10px 20px;\">\n" +
	"        <div class=\"content-container\" style=\"margin: 20px auto 0 auto;\">\n" +
	"         {{CONTENT}}  \n" +
	"        </div>\n" +
	"    </div>\n" +
	"\n" +
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
	"            const h1 = document.querySelector('h1');\n" +
	"            if (h1) {\n" +
	"                const styleOverride = document.createElement('style');\n" +
	"                styleOverride.textContent = `\n" +
	"                    h1::before {\n" +
	"                        content: none !important;\n" +
	"                    }\n" +
	"                `;\n" +
	"                document.head.appendChild(styleOverride);\n" +
	"            }\n" +
	"\n" +
	"            const username = '{{USERNAME}}';\n" +
	"\n" +
	"            if (h1) {\n" +
	"                h1.style.position = 'relative';\n" +
	"                const badgeLink = document.createElement('a');\n" +
	"                badgeLink.href = `https://markbyte.xyz/${username}`;\n" +
	"                badgeLink.target = '_blank';\n" +
	"                badgeLink.textContent = `${username} 🚀`;\n" +
	"                badgeLink.style.position = 'absolute';\n" +
	"                badgeLink.style.top = '0';\n" +
	"                badgeLink.style.right = '0';\n" +
	"                badgeLink.style.fontSize = '1rem';\n" +
	"                badgeLink.style.color = 'var(--neon-green)';\n" +
	"                badgeLink.style.background = 'rgba(10, 255, 157, 0.1)';\n" +
	"                badgeLink.style.padding = '5px 10px';\n" +
	"                badgeLink.style.borderRadius = '5px';\n" +
	"                badgeLink.style.fontWeight = 'normal';\n" +
	"                badgeLink.style.textDecoration = 'underline';\n" +
	"                badgeLink.style.whiteSpace = 'nowrap';\n" +
	"                badgeLink.style.zIndex = '10';\n" +
	"\n" +
	"                h1.appendChild(badgeLink);\n" +
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
	"    <footer id=\"footer\" style=\"\n" +
	"        text-align: center;\n" +
	"        font-size: 0.8rem;\n" +
	"        margin-top: 20px;\n" +
	"        margin-bottom: 10px;\n" +
	"        color: var(--neon-green);\n" +
	"        opacity: 0.6;\n" +
	"        font-family: 'Space Mono', monospace;\n" +
	"    \">\n" +
	"        made with 🚀 and <a href=\"https://markbyte.xyz\" target=\"_blank\" style=\"color: var(--neon-green); text-decoration: underline;\">markbyte</a>\n" +
	"    </footer>\n" +
	"</body>\n" +
	"</html>"

const pink_template = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markbyte</title>
    <link rel="stylesheet" href="https://markbyteblogfiles.s3.us-east-1.amazonaws.com/pinkstyle.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">
    <style>
        .title-and-date {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            gap: 0px;
            margin: 0 auto !important;
            padding: 0 !important;
        }
    </style>
</head>
<body>
    <div class="page-container">
        <header>
            <div class="leaf left"></div>
            <div class="title-and-date">
                <a href="https://markbyte.xyz/{{USERNAME}}" target="_blank" class="site-title-link">
                    <h1 class="site-title">{{NAME}}</h1>
                </a> <br>
                <div class="post-meta" style="font-size: 0.75rem;">
                    Posted on {{DATE}}
                </div>
            </div>
            <div class="leaf right"></div>
        </header>
        
        <main class="content">
            <div class="markdown-content">
                {{CONTENT}}
            </div>
        </main>
        
        <footer>
            <div class="footer-pattern"></div>
            <div class="footer-text">Made with 🌸 and <a href="https://markbyte.xyz" target="_blank" class="markbyte-link">markbyte</a></div>
        </footer>
    </div>
</body>
</html>
`
