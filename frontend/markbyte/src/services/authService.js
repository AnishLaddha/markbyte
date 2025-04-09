import axios from "axios";
import { API_URL } from "@/config/api";

// Signup user
export const signup = (username, password, email = "") => {
  return axios.post(
    `${API_URL}/signup`,
    { username, password, email },
    {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    }
  );
};

// Login user
export const loginUser = (username, password) => {
  return axios.post(
    `${API_URL}/login`,
    { username, password },
    {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    }
  );
};

// Logout user
export const logoutUser = () => {
  return axios.post(`${API_URL}/logout`, {}, { withCredentials: true });
};
