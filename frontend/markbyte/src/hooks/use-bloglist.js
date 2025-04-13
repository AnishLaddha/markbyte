import { useState, useEffect, useCallback } from "react";
import { fetchBlogPosts } from "@/services/blogService";

function useBlogList(user) {
  const [postdata, setData] = useState([]);
  const [profilepicture, setProfilePicture] = useState(null);
  const [error, setError] = useState(null);

  const fetchPosts = useCallback(() => {
    fetchBlogPosts(user)
      .then((response) => {
        const posts = response.data?.posts || [];
        const profilePic = response.data?.profile_picture;

        if (posts.length === 0) {
          setData([]);
          setProfilePicture(profilePic ? profilePic + "?t=" + Date.now() : null);
          return;
        }

        const sortedPosts = posts.sort(
          (a, b) => new Date(b.date_uploaded) - new Date(a.date_uploaded)
        );
        setData(sortedPosts);
        setProfilePicture(profilePic + "?t=" + Date.now());
      })
      .catch((err) => {
        setError(err.message || "Failed to fetch blog posts.");
        setData([]);
        setProfilePicture(null);
      });
  }, [user]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { postdata, profilepicture, error, fetchPosts };
}

export default useBlogList;