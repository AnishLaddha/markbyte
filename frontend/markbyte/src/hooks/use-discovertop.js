import { useState, useEffect, useCallback } from "react";
import { fetchDiscoverTopPosts } from "@/services/blogService";
import { setCache, getCache } from "@/utils/cache";

function useDiscoverTop() {
  const [topPosts, setTopPosts] = useState([]);

  const handleData = useCallback((newData) => {
    if (!newData || newData.length === 0) {
        setTopPosts([]);
        setCache("discover_top_posts", []);
        return;
    }
    const posts = newData["posts"];
    setTopPosts(posts);
    setCache("discover_top_posts", posts);
  }, []);

  const fetchTopDiscoverData = useCallback(() => {
    const cachedData = getCache("discover_top_posts");
    if (cachedData) {
      setTopPosts(cachedData);
      return;
    }
    fetchDiscoverTopPosts()
      .then((response) => {
        handleData(response.data);
      })
      .catch((error) => console.error("Error fetching top discover data:", error));
  }, [handleData]);

  useEffect(() => {
    fetchTopDiscoverData();
  }, [fetchTopDiscoverData]);

  return { topPosts, fetchTopDiscoverData };
}

export default useDiscoverTop;
