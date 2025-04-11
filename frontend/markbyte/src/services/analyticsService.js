import axios from "axios";
import { API_URL } from "@/config/api";

export const getViewTimestamps = () => {
  return axios.get(`${API_URL}/user/analytics/timestamps`, {
    withCredentials: true,
  });
};

export const getAllAnalytics = () => {
  return axios.get(`${API_URL}/user/analytics`, { withCredentials: true });
}
