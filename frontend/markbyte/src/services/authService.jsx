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