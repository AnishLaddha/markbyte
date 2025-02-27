import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useParams,
} from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import Home from "./components/pages/Home/Home";
import Auth from "./components/pages/Auth/Auth";
import Loading from "./components/pages/Loading/Loading";
import BloggerLandingPage from "./components/pages/BloggerLanding/BloggerLanding";
import BloggerHome from "./components/pages/BloggerHome/BloggerHome";
import { useAuth } from "./contexts/AuthContext";
import { Toaster } from "./components/ui/toaster";
import { motion} from "framer-motion";
import "./App.css";

// function Footer() {
//   return (
//     <footer className="footer">
//       <p>&copy; Group 11. Rishab Pangal, Anish Laddha, Shrijan Swaminathan</p>
//     </footer>
//   );
// }

function DynamicBlogPost() {
  const { user, post } = useParams();

  useEffect(() => {
    axios
      .get(`http://localhost:8080/${user}/${post}`)
      .then((response) => {
        console.log("Fetched blogger's post page:", response);
        document.open();
        document.write(response.data);
        document.close();
      })
      .catch((error) => {
        console.error("Error fetching blogger's post page:", error);
      });
  }, [user, post]);

  return null;
}

function App() {
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated !== undefined) {
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    }
  }, [isAuthenticated]);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isLoading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Loading />
              </motion.div>
            ) : !isAuthenticated ? (
              <Home />
            ) : (
              <BloggerHome />
            )
          }
        />
        <Route path="/loading" element={<Loading />} />
        <Route path="/:user/:post" element={<DynamicBlogPost />} />
        <Route path="/:username" element={<BloggerLandingPage />} />
        <Route
          path="/auth"
          element={isAuthenticated ? <BloggerHome /> : <Auth />}
        />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
