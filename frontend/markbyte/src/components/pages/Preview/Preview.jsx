import React, { useRef, useEffect } from "react";
import { marked } from "marked";

function Preview({ markdownContent, renderMarkdown, setRenderMarkdown }) {
  const iframeRef = useRef(null);

  useEffect(() => {
    if (renderMarkdown && markdownContent !== null) {
      const htmlfrommd = marked.parse(markdownContent);
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
            ${htmlfrommd}
          </div>
        </body>
        </html>
      `;

      const iframe = iframeRef.current;
      if (iframe) {
        iframe.contentDocument.open();
        iframe.contentDocument.write(templateHTML);
        iframe.contentDocument.close();
      }
      setRenderMarkdown(false); // Reset renderMarkdown to false
    }
  }, [markdownContent, renderMarkdown]);

  return (
    <div className="h-[calc(100vh-64px-50px)] overflow-hidden">
      <iframe
        ref={iframeRef}
        title="Dynamic Blog Post"
        className="w-full h-full border-none"
      />
    </div>
  );
}

export default Preview;
