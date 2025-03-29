import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { API_URL } from "@/config/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        const timestamp = parsedUser.time_loggedin;
        const currentTime = new Date().getTime();
        const timeDifference = currentTime - timestamp;
        // if timeDifference > 72 hours, automatically set isAuthenticated to false
        if (timeDifference > 259200000) {
          localStorage.removeItem("user");
          setIsAuthenticated(false);
          setUser(null);
        }
        else{
          setIsAuthenticated(true);
          setUser(parsedUser);
        }
      } catch (error) {
        localStorage.removeItem("user");
        setIsAuthenticated(false);
      }
    }
  }, []);

  const login = (userInfo) => {
    localStorage.setItem("user", JSON.stringify(userInfo));
    setIsAuthenticated(true);
    setUser(userInfo);
  };

  const logout = () => {
    axios.post(`${API_URL}/logout`, {}, { withCredentials: true });
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
