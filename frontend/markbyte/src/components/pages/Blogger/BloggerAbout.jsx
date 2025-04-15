import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import NotFound from "../404/invalid";
import { getUserAbout } from "@/services/userService";

function DynamicAboutPage() {
  const { user } = useParams();
  const [error, setError] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");

  useEffect(() => {
    getUserAbout(user)
      .then((response) => {
        setHtmlContent(response.data);
      })
      .catch(() => {
        setError(true);
      });
  }, [user]);

  if (error) return <NotFound />;

  return (
    <iframe
      srcDoc={htmlContent}
      title="Blog Post"
      className="w-full h-screen border-none"
    />
  );
}

export default DynamicAboutPage;
