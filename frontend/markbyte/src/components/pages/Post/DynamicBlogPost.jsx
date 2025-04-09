import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import NotFound from "../404/invalid";
import { getBlogPost } from "@/services/blogService";

function DynamicBlogPost() {
  const { user, post } = useParams();
  const [error, setError] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");

  useEffect(() => {
    getBlogPost(user, post)
      .then((response) => {
        setHtmlContent(response.data);
      })
      .catch(() => {
        setError(true);
      });
  }, [user, post]);

  if (error) return <NotFound />;

  return (
    <iframe
      srcDoc={htmlContent}
      title="Blog Post"
      className="w-full h-screen border-none"
    />
  );
}

export default DynamicBlogPost;
