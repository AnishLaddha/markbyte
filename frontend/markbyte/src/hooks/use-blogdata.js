import { useState, useEffect, useCallback } from "react";
import axios from "axios";

function useBlogData() {
  const [data, setData] = useState([]);

  const handleData = useCallback((newData) => {
    let transformedData = [];
    for (let i = 0; i < newData.length; i++) {
      const versions = newData[i].versions;
      const versionNumbers = versions.map((version) => version.version);
      const activeVersion = versions.find((version) => version.is_active);
      // find version that is active and get its link
      let link = activeVersion?.link || null;
      let directLink = activeVersion?.direct_link || null;
      // if link contains /static then append http://localhost:8080 to it
      // otherwise it is the link of the blog on S3
      // will ultimately be changed to be markbyte.xyz/user/blogname
      if (link && !link.includes("/static")) {
        link = "http://localhost:5173" + directLink;
      }
      else{
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = useCallback(() => {
    axios
      .get("http://localhost:8080/user/blog_posts", { withCredentials: true })
      .then((response) => {
        handleData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching blogger's blog posts:", error);
      });
  }, [handleData]);  

  return { data, handleData, fetchData };
}

export default useBlogData;