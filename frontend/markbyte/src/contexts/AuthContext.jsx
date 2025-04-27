/* This established global authentication context for the application. It manages user authentication state, user information, 
and provides login and logout functionality. */

import React, { createContext, useState, useEffect, useContext } from "react";
import { getUserInfo } from "@/services/userService";
import { loginUser, logoutUser } from "@/services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(undefined);
  const [user, setUser] = useState(null);
  const [name, setName] = useState(null);
  const [profilepicture, setProfilePicture] = useState(null);
  const [email, setEmail] = useState(null);
  const [style, setStyle] = useState(null);

  // Used to check if the user is authenticated and set the global user state
  const fetchUserInfo = async () => {
    try {
      const response = await getUserInfo();
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

  // Check if the user is authenticated when the component mounts
  // and set the user state accordingly
  useEffect(() => {
    fetchUserInfo();
  }, []);

  // Logs the user in and fetches user info, updating the global state
  const login = async (username, password) => {
    try {
      const response = await loginUser(username, password);
      if (response.status === 200) {
        await fetchUserInfo();
        localStorage.clear();
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  };

  // Logs the user out, clears local storage, and resets the global state
  const logout = () => {
    logoutUser();
    setIsAuthenticated(false);
    localStorage.clear();
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
