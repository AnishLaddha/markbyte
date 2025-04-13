import { useState, useEffect, useCallback } from "react";
import { getAllAnalytics } from "@/services/analyticsService";
import { FRONTEND_URL } from "@/config/api";

function useAnalyticData(username) {
  const [analyticdata, setData] = useState([]);

  const handleData = useCallback((newData) => {
    if (!newData) {
      setData([]);
      return;
    }
    let transformedData = [];
    for (let i = 0; i < newData.length; i++) {
      let date = newData[i].date;
      let title = newData[i].title;
      let version = newData[i].version;
      let views = newData[i].views.length;
      // put date in a date object
      let dateObj = new Date(date);
      const formattedDate = dateObj.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      let link = `${FRONTEND_URL}/${username}/${title}/analytics`;
      transformedData.push({
        title: title,
        date: formattedDate,
        version: version,
        views: views,
        link: link,
      });
    }
    transformedData.sort((a, b) => new Date(b.date) - new Date(a.date));
    setData(transformedData);
  }, []);

  const fetchAnalytics = useCallback(() => {
    getAllAnalytics()
      .then((response) => handleData(response.data))
      .catch((error) => console.error("Error fetching analytics:", error));
  }, [handleData]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { analyticdata, fetchAnalytics };
}

export default useAnalyticData;
