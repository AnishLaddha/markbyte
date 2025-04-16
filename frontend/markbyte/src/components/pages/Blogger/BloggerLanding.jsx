import { useParams } from "react-router-dom";
import useBlogList from "@/hooks/use-bloglist";
import React from "react";
import NotFound from "../404/invalid";
import ClassicLandingPage from "./BloggerLanding/Classic";
import DefaultLandingPage from "./BloggerLanding/Default";
import FuturisticLandingPage from "./BloggerLanding/Futuristic";

const BloggerLandingPage = React.memo(function BloggerLandingPage() {
  const { username } = useParams();
  const {
    postdata: blogList,
    profilepicture,
    error,
    style,
    fetchPosts,
  } = useBlogList(username);

  if (error) {
    return <NotFound />;
  }

  if (!username) {
    return <NotFound />;
  }

  if (style === "old") {
    return (
      <ClassicLandingPage
        username={username}
        blogList={blogList}
        profilepicture={profilepicture}
        fetchPosts={fetchPosts}
      />
    );
  } else if (style === "default") {
    return (
      <DefaultLandingPage
        username={username}
        blogList={blogList}
        profilepicture={profilepicture}
        fetchPosts={fetchPosts}
      />
    );
  } else if (style === "futuristic") {
    return (
      <FuturisticLandingPage
        username={username}
        blogList={blogList}
        profilepicture={profilepicture}
        fetchPosts={fetchPosts}
      />
    );
  } else {
    return (
      <DefaultLandingPage
        username={username}
        blogList={blogList}
        profilepicture={profilepicture}
        fetchPosts={fetchPosts}
      />
    );
  }
});

export default BloggerLandingPage;
