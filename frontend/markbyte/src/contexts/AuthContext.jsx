import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { API_URL } from "@/config/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(undefined);
  const [user, setUser] = useState(null);
  const [name, setName] = useState(null);
  const [profilepicture, setProfilePicture] = useState(null);
  const [email, setEmail] = useState(null);
  const [style, setStyle] = useState(null);

  const fetchUserInfo = async () => {
    try {
      const response = await axios.get(`${API_URL}/user/info`, {
        withCredentials: true,
      });

      if (response.status === 200) {
        const userInfo = response.data;
        setIsAuthenticated(true);
        setUser({ name: userInfo.username });
        setName(userInfo.name);

        // Add cache busting to the profile picture URL
        const cacheBustedProfilePicture = userInfo.profile_picture
          ? `${userInfo.profile_picture}?t=${Date.now()}`
          : userInfo.profile_picture;

        setProfilePicture(cacheBustedProfilePicture);
        setEmail(userInfo.email);
        setStyle(userInfo.style);
        const combinedData = {
          style: userInfo.style || "default",
          name: userInfo.name || "User",
          profilepicture: cacheBustedProfilePicture,
          email: userInfo.email || null,
        };
        return combinedData;
      } else {
        setIsAuthenticated(false);
        setUser(null);
        return false;
      }
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      return false;
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axios.post(
        `${API_URL}/login`,
        { username, password },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        await fetchUserInfo();
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  };

  const logout = () => {
    axios.post(`${API_URL}/logout`, {}, { withCredentials: true });
    setIsAuthenticated(false);
    setUser(null);
    setName(null);
    setProfilePicture(null);
    setEmail(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        name,
        profilepicture,
        email,
        style,
        login,
        logout,
        fetchUserInfo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
