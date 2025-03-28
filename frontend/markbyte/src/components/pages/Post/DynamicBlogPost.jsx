import { useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { API_URL } from "@/config/api";

function DynamicBlogPost() {
  const { user, post } = useParams();

  useEffect(() => {
    axios
      .get(`${API_URL}/${user}/${post}`)
      .then((response) => {
        document.open();
        document.write(response.data);
        document.close();
      })
      .catch((error) => {
        console.error("Error fetching blogger's post page:", error);
      });
  }, [user, post]);

  return null;
}

export default DynamicBlogPost;
