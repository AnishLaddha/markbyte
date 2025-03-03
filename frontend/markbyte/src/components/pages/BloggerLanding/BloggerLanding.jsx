import { useParams } from "react-router-dom";
import useBlogList from "@/hooks/use-bloglist";
import { useEffect } from "react";
import { useMediaQuery } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CalendarIcon } from "lucide-react";
import styles from "./BloggerLanding.module.css";
import { useAuth } from "@/contexts/AuthContext";
import { CiLogin } from "react-icons/ci";
import UserDropdown from "@/components/ui/profiledropdown";

function BloggerLandingPage() {
  const { username } = useParams();
  const { data: blogList, fetchPosts } = useBlogList(username);
  const isSmallScreen = useMediaQuery("(max-width:470px)");
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!blogList || blogList.length === 0) {
      fetchPosts();
    }
  }, [username, fetchPosts, blogList]);
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date) ? "Date Unknown" : date.toLocaleDateString();
  };

  return (
    <div className={styles.BloggerLanding}>
      <header className="sticky top-0 left-0 w-full h-16 flex justify-between items-center px-4 md:px-6 bg-[#084464] text-white shadow-md z-10">
        <div
          className="flex items-center cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img
            src="/assets/markbytealt.png"
            alt="MarkByte Logo"
            className="h-8 w-auto"
          />
          {!isSmallScreen && (
            <span className="text-xl font-semibold">arkByte</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <UserDropdown userName={user.name} logout={logout} />
          )}
          {!isAuthenticated && (
            <div className="flex gap-2">
              <button
                className="flex items-center text-sm text-black font-medium bg-white border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-100 focus:outline-none active:ring-0 mr-2"
                onClick={() => navigate("/auth?tab=login")}
              >
                Login
                <CiLogin className="ml-1" />
              </button>
              <button
                className="flex items-center text-sm text-black font-medium bg-white border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-100 focus:outline-none active:ring-0"
                onClick={() => navigate("/auth?tab=signup")}
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </header>
      <main className="container mx-auto mt-8 px-4 mb-16">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">
          {username}'s Blog
        </h1>
        <p className="text-lg mb-8 text-gray-600">
          Explore {username}'s recent blog posts
        </p>

        <div className="space-y-6">
          {!blogList && (
            <Card className="w-full py-12">
              <CardContent className="text-center">
                <p className="text-gray-500">No blog posts available yet</p>
              </CardContent>
            </Card>
          )}
          {blogList &&
            blogList.map((post) => (
              <Card
                key={post.user + post.title}
                className="overflow-hidden md:w-[80%] md:h-[200px] cursor-pointer transition-shadow duration-300 ease-in-out shadow-none hover:shadow-lg"
                onClick={() => {
                  if (post.link.includes("static")) {
                    navigate(post.link);
                  } else {
                    navigate(post.direct_link);
                  }
                }}
              >
                <div className="flex flex-col md:flex-row">
                  {!post.image && (
                    <div className="w-full md:w-64 h-48 md:h-64 bg-[#084464] flex items-center justify-center">
                      <img
                        src="/assets/markbytealt.png"
                        alt="MarkByte Logo"
                        className="h-full w-full object-contain opacity-50"
                      />
                    </div>
                  )}

                  <div className="flex-1 flex flex-col">
                    <CardHeader className="pb-2">
                      <div className="flex items-center mb-2">
                        <div className="flex items-center text-sm text-gray-500">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          {formatDate(post.date_uploaded)}
                        </div>
                      </div>
                      <h2 className="text-3xl font-semibold text-gray-800">
                        {post.title}
                      </h2>
                    </CardHeader>

                    <CardContent>
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-2">
                          <span className="text-primary font-medium">
                            {post.user.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {post.user}
                        </span>
                      </div>
                    </CardContent>

                    {/* <CardFooter className="flex gap-2">
                    {post.link && (
                      <Button variant="default" size="sm" asChild>
                        <a href={post.link}>Read More &rarr;</a>
                      </Button>
                    )}
                  </CardFooter> */}
                  </div>
                </div>
              </Card>
            ))}
        </div>
      </main>
    </div>
  );
}

export default BloggerLandingPage;
