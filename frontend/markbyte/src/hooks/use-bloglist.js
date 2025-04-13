import { useState, useEffect, useCallback } from "react";
import { fetchBlogPosts } from "@/services/blogService";

function useBlogList(user) {
  const [data, setData] = useState([]);

  const fetchPosts = useCallback(() => {
    fetchBlogPosts(user)
      .then((response) => setData(response.data))
      .catch((error) => console.error("Error fetching posts:", error));
  }, [user]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { data, fetchPosts };
}

export default useBlogList;
