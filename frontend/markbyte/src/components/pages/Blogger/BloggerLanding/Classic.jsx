/* Classic Landing Page Component*/
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import React from "react";
import { motion } from "framer-motion";
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

function ClassicLandingPage({
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

  // Handle page navigation
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
    <div className="relative min-h-screen bg-[#f6f8fa] overflow-x-hidden flex flex-col">
      <div className="w-full bg-gradient-to-r from-[#084464] to-[#011522] py-20 relative overflow-hidden">
        <div className="absolute left-0 top-0 w-20 h-20 grid grid-cols-5 gap-2 opacity-60 mt-6 ml-6">
          {[...Array(25)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-white opacity-20"
            ></div>
          ))}
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-left mb-10 ml-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-8"
          >
            <div className="flex items-center gap-5">
              <Avatar className="h-32 w-32 border-2 border-white/20 shadow-lg">
                <AvatarImage
                  src={profilepicture || "/placeholder.svg"}
                  alt={username}
                  className="object-cover w-full h-full"
                />
                <AvatarFallback className="bg-[#0B5D89] text-white">
                  {username.charAt(0).toLocaleUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div>
                <h1 className="text-5xl md:text-6xl font-bold mb-4 text-white tracking-tight leading-tight">
                  {username}'s Blog
                </h1>
                <p className="text-xl md:text-2xl max-w-2xl text-white">
                  Explore {username}'s blog posts and articles.
                </p>
              </div>
            </div>

            <div className="flex flex-row items-center gap-4">
              <button
                className="bg-[#084464] hover:bg-[#0B5D89] rounded-full p-2 shadow-lg transition-all duration-300 ease-in-out flex items-center justify-center"
                onClick={() => {
                  navigate("/");
                }}
              >
                <Home className="h-8 w-8 text-white" />
              </button>
              <button
                className="px-6 py-3 text-lg font-medium text-white bg-[#084464] hover:bg-[#0B5D89] rounded-lg shadow-lg transition-all duration-300 ease-in-out flex items-center"
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

      <main className="container mx-auto mt-16 px-8 mb-24 flex-grow">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-4xl font-bold text-black flex items-center">
            <Globe className="h-8 w-8 mr-3 text-black" />
            <span>Table of Contents</span>
          </h2>
          <div className="flex items-center text-sm text-[#005a7a]">
            <Bookmark className="h-4 w-4 mr-2" />
            {blogList?.length || 0} Posts
          </div>
        </div>
        <div className="space-y-10">
          {blogList.length === 0 && (
            <Card className="w-full py-20 bg-gradient-to-br from-gray-50 to-white border-0">
              <CardContent className="text-center">
                <div className="flex flex-col items-center">
                  <div className="rounded-full bg-gray-100 p-8 mb-6">
                    <Bookmark className="h-14 w-14 text-gray-300" />
                  </div>
                  <h3 className="text-2xl font-medium text-gray-700 mb-3">
                    No posts yet
                  </h3>
                  <p className="text-gray-500 max-w-md text-lg">
                    {username} hasn't published any blog posts yet. Check back
                    later!
                  </p>
                </div>
              </CardContent>
            </Card>
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
                      className="bg-white text-black border border-gray-200 shadow hover:shadow-lg transition-all duration-300 group cursor-pointer"
                      onClick={() => {
                        console.log("check!");
                        if (post.post.link.includes("static")) {
                          window.open(post.post.link, "_blank");
                        } else {
                          window.open(post.post.direct_link, "_blank");
                        }
                      }}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            {formatDate(post.post.date_uploaded)}
                          </div>
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            <span>{post.views.length} views</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold mb-3 group-hover:text-[#005a7a] transition-colors duration-300">
                              {post.post.title}
                            </h3>
                            <div className="flex items-center font-medium group-hover:text-[#005a7a] transition-colors duration-300">
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
        {blogList && blogList.length > nposts && (
          <div className="mt-16 flex justify-center">
            <Pagination>
              <PaginationContent className="flex items-center gap-4">
                <PaginationItem>
                  <PaginationPrevious
                    onClick={handlePrevPage}
                    className={`cursor-pointer ${
                      currentPage === 0
                        ? "pointer-events-none opacity-50"
                        : "hover:bg-gray-100"
                    }`}
                  />
                </PaginationItem>

                <div className="text-[#084464] font-medium">
                  Page {currentPage + 1} of {npages}
                </div>

                <PaginationItem>
                  <PaginationNext
                    onClick={handleNextPage}
                    className={`cursor-pointer ${
                      (currentPage + 1) * nposts >= blogList.length
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
      <footer className="py-3 text-center z-20">
        <p className="text-gray-400 text-sm">
          Made with ❤️ by
          <a
            href="/about"
            className="text-blue-400 hover:text-blue-300 transition duration-200"
            target="_blank"
            rel="noopener noreferrer"
          >
            {" "}
            MarkByte's Developers
          </a>
        </p>
      </footer>
    </div>
  );
}

export default ClassicLandingPage;
