import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Home from "./components/pages/Home/Home";
import Auth from "./components/pages/Auth/Auth";
// import Loading from "./components/pages/Loading/Loading";
import About from "./components/pages/About/About";
import BloggerLandingPage from "./components/pages/BloggerLanding/BloggerLanding";
import BloggerHome from "./components/pages/BloggerHome/BloggerHome";
import EditorPreview from "./components/pages/LivePreview/CreateEditorPreview";
import PublishEditorPreview from "./components/pages/LivePreview/PublishEditorPreview";
import DynamicBlogPost from "./components/pages/Post/DynamicBlogPost";
import BloggerProfile from "./components/pages/BloggerProfile/BloggerProfile";
import { useAuth } from "./contexts/AuthContext";
import { Toaster } from "./components/ui/toaster";
import "./App.css";

function App() {
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated !== undefined) {
      setIsLoading(false); // will keep loading until isAuthenticated is defined
    }
  }, [isAuthenticated]);

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isLoading ? (
              console.log("Loading...")
            ) : !isAuthenticated ? (
              <Home />
            ) : (
              <BloggerHome />
            )
          }
        />
        <Route path="/about" element={<About />} />
        <Route
          path="/editor"
          element={
            isLoading ? (
              console.log("Loading...")
            ) : !isAuthenticated ? (
              <Home />
            ) : (
              <EditorPreview />
            )
          }
        />
        <Route
          path="/editor/:title/:version"
          element={
            isLoading ? (
              console.log("Loading...")
            ) : !isAuthenticated ? (
              <Home />
            ) : (
              <PublishEditorPreview />
            )
          }
        />
        <Route path="/:user/:post" element={<DynamicBlogPost />} />
        <Route path="/:username" element={<BloggerLandingPage />} />
        <Route
          path="/profile"
          element={
            isLoading ? (
              console.log("Loading...")
            ) : !isAuthenticated ? (
              <Home />
            ) : (
              <BloggerProfile />
            )
          }
        />
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
