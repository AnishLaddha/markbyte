import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { API_URL } from "@/config/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios
      .get(`${API_URL}/auth`, { withCredentials: true })
      .then((response) => {
        // check reponse code
        if (response.status === 200) {
          const userInfo = response.data;
          setIsAuthenticated(true);
          setUser({name: userInfo});
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      })
      .catch((error) => {
        console.error("Error checking authentication:", error);
        setIsAuthenticated(false);
        setUser(null);
      });
  }, []);

  const login = (userInfo) => {
    setIsAuthenticated(true);
    setUser(userInfo);
  };

  const logout = () => {
    axios.post(`${API_URL}/logout`, {}, { withCredentials: true });
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
