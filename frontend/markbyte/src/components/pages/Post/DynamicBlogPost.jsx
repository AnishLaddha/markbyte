import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import NotFound from "../404/invalid";
import { API_URL } from "@/config/api";

function DynamicBlogPost() {
  const { user, post } = useParams();
  const [error, setError] = useState(false);

  useEffect(() => {
    axios
      .get(`${API_URL}/${user}/${post}`)
      .then((response) => {
        document.open();
        document.write(response.data);
        document.close();
      })
      .catch((error) => {
        setError(true);
      });
  }, [user, post]);

  // On error, show NotFound
  if (error) return <NotFound />;

  return null;
}

export default DynamicBlogPost;