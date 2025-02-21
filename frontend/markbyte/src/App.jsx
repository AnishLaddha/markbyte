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

  useEffect(() => {
    axios.get(`http://localhost:8080/${user}/${post}`)
      .then((response) => {
        console.log("Fetched blogger's post page:", response);
        document.open();  // Open document stream
        document.write(response.data); // Write full new document
        document.close(); // Close document stream
      })
      .catch((error) => {
        console.error("Error fetching blogger's post page:", error);
      });
  }, [user, post]);

  return null; // This component does not render anything in React
}


function App() {
  const { isAuthenticated } = useAuth();

  // useEffect(() => {
  //   document.documentElement.classList.add("dark");
  // }
  // , []);
  return (
      <Router>
          <Routes>
            <Route path="/" element={isAuthenticated ? <BloggerHome /> : <Home />} />
            <Route path="/:user/:post" element={<DynamicBlogPost/>} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
          </Routes>
        <Toaster />
      </Router>
  );
}

export default App;
