/* Default Landing Page Component */
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import React from "react";
import {
  Bookmark,
  Eye,
  User2,
  CalendarIcon,
  Home,
  Globe,
  ArrowRight,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function DefaultLandingPage({
  username,
  blogList,
  profilepicture,
  fetchPosts,
}) {
  const nposts = 6;
  const [currentPage, setCurrentPage] = React.useState(0);
  const [npages, setNPages] = React.useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (blogList === null || blogList.length === 0) {
      fetchPosts();
    }
  }, [username, fetchPosts]);

  useEffect(() => {
    setNPages(Math.ceil((blogList?.length || 0) / nposts));
  }, [blogList, nposts]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date) ? "Date Unknown" : date.toLocaleDateString();
  };

  const handleNextPage = () => {
    if ((currentPage + 1) * nposts < blogList.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 text-white overflow-x-hidden">
      <div className="w-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-black pointer-events-none"></div>
        <div className="container mx-auto px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-left mb-10 ml-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-8"
          >
            <div className="flex items-center gap-8">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-gray-100 to-blue-300 rounded-full blur-sm opacity-70"></div>
                <Avatar className="h-32 w-32 border-2 border-white shadow-xl relative">
                  <AvatarImage
                    src={
                      profilepicture ||
                      `https://api.dicebear.com/9.x/initials/svg?seed=${
                        username || "User"
                      }&backgroundType=gradientLinear`
                    }
                    className="object-cover w-full h-full"
                  />
                  <AvatarFallback className="bg-white text-black text-2xl">
                    {(username || "U").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
                  {username}'s <span className="text-white">Blog</span>
                </h1>
                <p className="text-xl md:text-2xl max-w-2xl text-gray-300 font-light">
                  Explore {username}'s blog posts and articles.
                </p>
              </div>
            </div>

            <div className="flex flex-row items-center gap-4">
              <button
                className="bg-white hover:bg-gray-100 rounded-full p-2 shadow-lg transition-all duration-300 ease-in-out flex items-center justify-center text-black"
                onClick={() => {
                  navigate("/");
                }}
              >
                <Home className="h-8 w-8 text-black" />
              </button>
              <button
                className="px-6 py-3 text-lg font-medium text-black bg-white hover:bg-gray-100 rounded-lg shadow-lg transition-all duration-300 ease-in-out flex items-center"
                onClick={() => {
                  navigate(`/${username}/about`);
                }}
              >
                <User2 className="mr-2" /> About
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto mt-16 px-8 mb-24">
        <div className="flex items-center justify-between mb-16">
          <h2 className="text-4xl font-bold text-white flex items-center">
            <Globe className="h-8 w-8 mr-3 text-white" />
            <span>Table of Contents</span>
          </h2>
          <div className="flex items-center text-sm text-white">
            <Bookmark className="h-4 w-4 mr-2" />
            {blogList?.length || 0} Posts
          </div>
        </div>

        <div className="space-y-10">
          {blogList.length == 0 && (
            <div className="opacity-100">
              <Card className="w-full py-20 bg-gradient-to-br from-gray-800 to-gray-900 border-0 shadow-xl">
                <CardContent className="text-center">
                  <div className="flex flex-col items-center">
                    <div className="rounded-full bg-gray-800 p-8 mb-6 border border-gray-700">
                      <Bookmark className="h-14 w-14 text-white" />
                    </div>
                    <h3 className="text-2xl font-medium text-white mb-3">
                      No posts yet
                    </h3>
                    <p className="text-gray-400 max-w-md text-lg">
                      {username} hasn't published any blog posts yet. Check back
                      later!
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          {blogList && blogList.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, staggerChildren: 0.1 }}
              className="grid md:grid-cols-2 gap-8"
            >
              {blogList
                .slice(currentPage * nposts, (currentPage + 1) * nposts)
                .map((post, index) => (
                  <motion.div
                    key={post.post.user + post.post.title + post.date_uploaded}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card
                      className="overflow-hidden border-0 bg-gradient-to-br from-gray-800 to-gray-900 hover:shadow-xl transition-all duration-300 group cursor-pointer"
                      onClick={() => {
                        if (post.post.link.includes("static")) {
                          window.open(post.post.link, "_blank");
                        } else {
                          window.open(post.post.direct_link, "_blank");
                        }
                      }}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center text-sm text-gray-300">
                            <CalendarIcon className="h-4 w-4 mr-1 text-white" />
                            {formatDate(post.post.date_uploaded)}
                          </div>
                          <div className="flex items-center text-sm text-gray-300">
                            <Eye className="h-4 w-4 mr-1 text-white" />
                            <span>{post.views.length} views</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-blue-400 transition-colors duration-300">
                              {post.post.title}
                            </h3>

                            <div className="flex items-center text-white font-medium group-hover:text-blue-300 transition-colors duration-300">
                              Read more <ArrowRight className="ml-2 h-4 w-4" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
            </motion.div>
          )}
        </div>

        {/* Pagination */}
        {blogList && blogList.length > 0 && npages > 1 && (
          <div className="mt-16 flex justify-center">
            <Pagination>
              <PaginationContent className="flex items-center gap-2">
                <PaginationItem>
                  <PaginationPrevious
                    onClick={handlePrevPage}
                    className={`cursor-pointer rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                      currentPage === 0
                        ? "pointer-events-none opacity-50"
                        : "hover:bg-gray-100"
                    }`}
                  />
                </PaginationItem>

                <div className="text-white font-medium">
                  Page {currentPage + 1} of {npages}
                </div>

                <PaginationItem>
                  <PaginationNext
                    onClick={handleNextPage}
                    className={`cursor-pointer rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                      currentPage >= npages - 1
                        ? "pointer-events-none opacity-50"
                        : "hover:bg-gray-100"
                    }`}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </main>
    </div>
  );
}

export default DefaultLandingPage;
