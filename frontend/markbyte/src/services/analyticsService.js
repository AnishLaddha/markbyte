import axios from "axios";
import { API_URL } from "@/config/api";

export const getViewTimestamps = () => {
  return axios.get(`${API_URL}/user/analytics/timestamps`, {
    withCredentials: true,
  });
};

export const getAllAnalytics = () => {
  return axios.get(`${API_URL}/user/analytics`, { withCredentials: true });
};

export const getPostAnalytics = (title, username, version = "") => {
  return axios.post(
    `${API_URL}/post/analytics`,
    { title, username, version },
    { withCredentials: true }
  );
};
