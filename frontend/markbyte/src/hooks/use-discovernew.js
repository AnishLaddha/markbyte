import { useState, useEffect, useCallback } from "react";
import { fetchDiscoverNewPosts } from "@/services/blogService";
import { setCache, getCache } from "@/utils/cache";

function useDiscoverNew() {
  const [newPosts, setNewPosts] = useState([]);

  const handleData = useCallback((newData) => {
    if (!newData || newData.length === 0) {
        setNewPosts([]);
        setCache("discover_new_posts", []);
        return;
      }
    const posts  = newData["posts"];
    setNewPosts(posts);
    setCache("discover_new_posts", posts);
  }, []);

  const fetchNewDiscoverData = useCallback(() => {
    const cachedData = getCache("discover_new_posts");
    if (cachedData) {
      setNewPosts(cachedData);
      return;
    }
    fetchDiscoverNewPosts()
      .then((response) => {
        handleData(response.data);
      })
      .catch((error) => console.error("Error fetching new discover data:", error));
  }, [handleData]);

  useEffect(() => {
    fetchNewDiscoverData();
  }, [fetchNewDiscoverData]);

  return { newPosts, fetchNewDiscoverData };
}

export default useDiscoverNew;
