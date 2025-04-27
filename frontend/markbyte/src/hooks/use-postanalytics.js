/* This custom hook fetches the the analytics data for a specific post, calculates the uptick in views for the current month and week, 
and transforms it into a format suitable for display.*/
import { useState, useEffect, useCallback } from "react";
import { getPostAnalytics } from "@/services/analyticsService";

function usePostAnalyticData(postname, user) {
  const [panalyticdata, setData] = useState([]);
  const [monthuptick, setMonthUptick] = useState(0);
  const [weekuptick, setWeekUptick] = useState(0);
  const [monthtotal, setMonthTotal] = useState(0);
  const [weektotal, setWeekTotal] = useState(0);
  // Used https://bito.ai/resources/javascript-get-week-number-javascript-explained/ to calculate week number
  function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    return [d.getUTCFullYear(), weekNo];
  }

  const handleData = useCallback(
    (newData) => {
      if (!newData) {
        setData([]);
        return;
      }

      let transformedViews = [];
      const timestamps = newData.views;

      for (let i = 0; i < timestamps.length; i++) {
        const date = timestamps[i];
        transformedViews.push({
          date: date,
          view: 1,
        });
      }

      const transformedData = {
        title: newData.title,
        timestamps: transformedViews,
        date: newData.date,
        version: newData.version,
      };
      setData(transformedData);

      // Calculate month uptick
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      let totalThisMonth = 0;
      let totalLastMonth = 0;

      const previousMonth = (currentMonth - 1 + 12) % 12;

      // Count views for current and previous month
      for (let i = 0; i < timestamps.length; i++) {
        const date = new Date(timestamps[i]);
        const month = date.getMonth();

        if (month === currentMonth) {
          totalThisMonth += 1;
        } else if (month === previousMonth) {
          totalLastMonth += 1;
        }
      }
      setMonthTotal(totalThisMonth);
      let monthUptickValue;
      if (totalLastMonth === 0) {
        monthUptickValue = totalThisMonth > 0 ? 100 : 0;
      } else {
        monthUptickValue =
          ((totalThisMonth - totalLastMonth) / totalLastMonth) * 100;
      }
      setMonthUptick(monthUptickValue.toFixed(1));

      const [, currentWeek] = getWeekNumber(currentDate);
      let totalThisWeek = 0;
      let totalLastWeek = 0;

      // Count views for current and previous week
      for (let i = 0; i < timestamps.length; i++) {
        const date = new Date(timestamps[i]);
        const [, week] = getWeekNumber(date);
        if (week === currentWeek) {
          totalThisWeek += 1;
        } else if (week === currentWeek - 1) {
          totalLastWeek += 1;
        }
      }      
      setWeekTotal(totalThisWeek);
      let weekUptickValue;
      if (totalLastWeek === 0) {
        weekUptickValue = totalThisWeek > 0 ? 100 : 0;
      } else {
        weekUptickValue =
          ((totalThisWeek - totalLastWeek) / totalLastWeek) * 100;
      }
      setWeekUptick(weekUptickValue.toFixed(1));
    },
    [setData, setMonthUptick, setWeekUptick]
  );

  const fetchPostAnalytics = useCallback(() => {
    getPostAnalytics(postname, user)
      .then((response) => handleData(response.data))
      .catch((error) => console.error("Error fetching post analytics:", error));
  }, [handleData]);

  useEffect(() => {
    fetchPostAnalytics();
  }, [fetchPostAnalytics]);

  return { panalyticdata, monthuptick, weekuptick, monthtotal, weektotal, fetchPostAnalytics };
}

export default usePostAnalyticData;
