import axios from "axios";
import { API_URL } from "@/config/api";

export const updateName = (name) => {
  return axios.post(`${API_URL}/user/name`, { name }, { withCredentials: true });
};

export const uploadProfilePicture = (file) => {
  const formData = new FormData();
  formData.append("profile_picture", file);
  return axios.post(`${API_URL}/user/pfp`, formData, { withCredentials: true });
};

export const updateStyle = (style) => {
  return axios.post(`${API_URL}/user/style`, { style }, { withCredentials: true });
};