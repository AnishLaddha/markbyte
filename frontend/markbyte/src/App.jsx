import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
function App() {
  const { isAuthenticated } = useAuth();
  return (
      <Router>
        <div className="app-container">
          <div className="content">
            <Routes>
              <Route path="/" element={isAuthenticated ? <BloggerHome /> : <Home />} />
              <Route path="/" element={<Home />} />
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
