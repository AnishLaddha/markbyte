import React, { useRef, useEffect } from "react";
import axios from "axios";

function Preview({ markdownContent, renderMarkdown, setRenderMarkdown }) {
  const iframeRef = useRef(null);

  useEffect(() => {
    // Only make the POST request when renderMarkdown is true
    if (renderMarkdown && markdownContent !== null) {
      axios
        .post(
          "http://localhost:8080/render",
          { markdown_content: markdownContent },
          { withCredentials: true }
        )
        .then((response) => {
          const templateHTML = response.data;
          const iframe = iframeRef.current;
          if (iframe) {
            iframe.contentDocument.open();
            iframe.contentDocument.write(templateHTML);
            iframe.contentDocument.close();
          }
        })
        .catch((error) => {
          console.error("Markdown render error:", error);
        })
        .finally(() => {
          setRenderMarkdown(false);
        });
    }
  }, [renderMarkdown, markdownContent, setRenderMarkdown]);

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
