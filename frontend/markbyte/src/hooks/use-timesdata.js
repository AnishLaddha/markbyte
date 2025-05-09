/* This custom hook fetches all the timestamps of views across all posts and returns the data in a format suitable for charting.*/

import { useState, useEffect, useCallback } from "react";
import { getViewTimestamps } from "@/services/analyticsService";

function useTimesData() {
  const [timedata, setData] = useState([]);

  const handleData = useCallback((newData) => {
    if (!newData) {
      setData([]);
      return;
    }
    let transformedData = [];
    const timestamps = newData.post_timestamps;
    for (let i = 0; i < timestamps.length; i++) {
      const date = timestamps[i];
      transformedData.push({
        date: date,
        view: 1,
      });
    }
    setData(transformedData);
  }, []);

  const fetchTimestamps = useCallback(() => {
    getViewTimestamps()
      .then((response) => handleData(response.data))
      .catch((error) => console.error("Error fetching view timestamps:", error));
  }, [handleData]);

  useEffect(() => {
    fetchTimestamps();
  }, [fetchTimestamps]);

  return { timedata, fetchTimestamps };
}

export default useTimesData;
