import axios from "axios";
import { API_URL } from "@/config/api";

// taken from https://remarkablemark.medium.com/how-to-generate-a-sha-256-hash-with-javascript-d3b2696382fd
async function sha256(message) {
  const utf8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", utf8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((bytes) => bytes.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

// Signup user
export const signup = async (username, password, email = "") => {
  const hashedPassword = await sha256(password);

  return axios.post(
    `${API_URL}/signup`,
    {
      username,
      password: hashedPassword,
      email,
    },
    {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    }
  );
};

// Login user
export const loginUser = async (username, password) => {
  const hashedPassword = await sha256(password);
  return axios.post(
    `${API_URL}/login`,
    { username, password: hashedPassword },
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
