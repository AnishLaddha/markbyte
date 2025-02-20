import React from "react";
import { BrowserRouter as Router, Routes, Route, useParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import Home from "./components/pages/Home/Home";
import Login from "./components/pages/Login/Login";
import SignUp from "./components/pages/SignUp/SignUp";
import BloggerHome from "./components/pages/BloggerHome/BloggerHome";
import { useAuth } from "./contexts/AuthContext";
import { Toaster } from "./components/ui/toaster";
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
  const [htmlContent, setHtmlContent] = useState(""); // Use state for reactivity
  useEffect(() => {
    axios.get(`http://localhost:8080/${user}/${post}`)
      .then((response) => {
        setHtmlContent(response.data); // Update state
      })
      .catch((error) => {
        console.error("Error fetching blogger's post page:", error);
      });
  }, [user, post]);

  return (
    <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
  );
}

function App() {
  const { isAuthenticated } = useAuth();

  // useEffect(() => {
  //   document.documentElement.classList.add("dark");
  // }
  // , []);
  return (
      <Router>
        <div className="app-container">
          <div className="content">
            <Routes>
              <Route path="/" element={isAuthenticated ? <BloggerHome /> : <Home />} />
              <Route path="/:user/:post" element={<DynamicBlogPost/>} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
            </Routes>
          </div>
        </div>
        <Toaster />
      </Router>
  );
}

export default App;
