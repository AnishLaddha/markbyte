import { useState, useEffect, useCallback } from "react";
import { API_URL, FRONTEND_URL } from "@/config/api";
import { fetchUserBlogPosts } from "@/services/blogService";

function useBlogData() {
  const [data, setData] = useState([]);

  const handleData = useCallback((newData) => {
    if (!newData) {
      setData([]);
      return;
    }
    let transformedData = [];
    for (let i = 0; i < newData.length; i++) {
      const versions = newData[i].versions;
      const versionNumbers = versions.map((version) => version.version);
      const activeVersion = versions.find((version) => version.is_active);
      let link = activeVersion?.link || null;
      let directLink = activeVersion?.direct_link || null;

      if (link && !link.includes("/static")) {
        link = `${FRONTEND_URL}` + directLink;
      } else {
        link = `${API_URL}` + link;
      }
      const date = activeVersion?.date_uploaded || null;
      transformedData.push({
        title: newData[i].title,
        date: date,
        link: link,
        latestVersion: newData[i].active_version || null,
        version: versionNumbers,
      });
    }
    transformedData.sort((a, b) => new Date(b.date) - new Date(a.date));
    setData(transformedData);
  }, []);

  const fetchData = useCallback(() => {
    fetchUserBlogPosts()
      .then((response) => handleData(response.data))
      .catch((error) =>
        console.error("Error fetching blogger's blog posts:", error)
      );
  }, [handleData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, fetchData };
}

export default useBlogData;
