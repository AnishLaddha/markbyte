import { useState, useEffect, useCallback } from "react";
import axios from "axios";

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
        link = "http://localhost:5173" + directLink;
      } else {
        link = "http://localhost:8080" + link;
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
    setData(transformedData);
  }, []);

  const fetchData = useCallback(() => {
    axios
      .get("http://localhost:8080/user/blog_posts", { withCredentials: true })
      .then((response) => handleData(response.data))
      .catch((error) => console.error("Error fetching blogger's blog posts:", error));
  }, [handleData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, fetchData };
}

export default useBlogData;