import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Home from "./components/pages/Home/Home";
import Auth from "./components/pages/Auth/Auth";
// import Loading from "./components/pages/Loading/Loading";
import About from "./components/pages/About/About";
import BloggerLandingPage from "./components/pages/Blogger/BloggerLanding";
import BloggerHome from "./components/pages/Blogger/BloggerHome";
import EditorPreview from "./components/pages/Editor/CreateEditorPreview";
import PublishEditorPreview from "./components/pages/Editor/PublishEditorPreview";
import DynamicBlogPost from "./components/pages/Post/DynamicBlogPost";
import BloggerProfile from "./components/pages/Blogger/BloggerProfile";
import NotFound from "./components/pages/404/invalid";
import PostAnalytics from "./components/pages/Post/PostAnalytics";
import DynamicAboutPage from "./components/pages/Blogger/BloggerAbout";
import Discover from "./components/pages/Discover/Discover";
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
              null
            ) : !isAuthenticated ? (
              <Home />
            ) : (
              <BloggerHome />
            )
          }
        />
        <Route path="/about" element={<About />} />
        <Route path="/discover" element={<Discover />} />
        <Route
          path="/editor"
          element={
            isLoading ? (
              null
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
              null
            ) : !isAuthenticated ? (
              <Home />
            ) : (
              <PublishEditorPreview />
            )
          }
        />
        <Route path="/:user/about" element={<DynamicAboutPage />} />
        <Route path="/:user/:post" element={<DynamicBlogPost />} />
        <Route
          path="/:user/:post/analytics"
          element={
            isLoading ? (
              null
            ) : !isAuthenticated ? (
              <Home />
            ) : (
              <PostAnalytics />
            )
          }
        />
        <Route path="/:username" element={<BloggerLandingPage />} />
        <Route
          path="/profile"
          element={
            isLoading ? (
              null
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
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
