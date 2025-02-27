import { useState, useEffect, useCallback } from "react";
import axios from "axios";

function useBlogList( user ) {
  const [data, setData] = useState([]);

  const fetchPosts = useCallback(() => {
    axios
      .get("http://localhost:8080/get_all_posts", {
        params: {
          user: user,
        },
      })
      .then((response) => setData(response.data))
      .catch((error) => console.error("Error fetching posts:", error));
  }, [user]);

  useEffect(() => {
    fetchPosts();
  }, []);

  return { data, fetchPosts };
}

export default useBlogList;