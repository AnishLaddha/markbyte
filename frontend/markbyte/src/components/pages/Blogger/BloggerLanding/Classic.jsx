import useBlogList from "@/hooks/use-bloglist";
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
  PaginationLink,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { useNavigate } from "react-router-dom";
import NotFound from "../../404/invalid";

function ClassicLandingPage({ username }) {
  const {
    postdata: blogList,
    profilepicture,
    error,
    fetchPosts,
  } = useBlogList(username);
  const nposts = 5;
  const [currentPage, setCurrentPage] = React.useState(0);
  const [npages, setNPages] = React.useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!blogList || blogList.length === 0) {
      fetchPosts();
    }
    setNPages(Math.ceil((blogList?.length || 0) / nposts));
  }, [username, fetchPosts, blogList, nposts]);

  if (error) {
    return <NotFound />;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date) ? "Date Unknown" : date.toLocaleDateString();
  };

  const getPageNumbers = () => {
    const totalPages = npages;
    const current = currentPage;
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i);
    }
    let pages = [];
    pages.push(0);
    const rangeStart = Math.max(1, current - 1);
    const rangeEnd = Math.min(totalPages - 2, current + 1);

    if (rangeStart > 1) {
      pages.push(null);
    }
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i);
    }
    if (rangeEnd < totalPages - 2) {
      pages.push(null);
    }
    if (totalPages > 1) {
      pages.push(totalPages - 1);
    }

    return pages;
  };

  return (
    <div className="relative min-h-screen bg-[#f6f8fa] overflow-x-hidden">
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
                  s
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
              <button className="px-6 py-3 text-lg font-medium text-white bg-[#084464] hover:bg-[#0B5D89] rounded-lg shadow-lg transition-all duration-300 ease-in-out flex items-center">
                <User2 className="mr-2" /> About
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      <main className="container mx-auto mt-16 px-8 mb-24">
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
          {!blogList && (
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
        {blogList && blogList.length > 0 && npages > 1 && (
          <div className="mt-16 flex justify-center">
            <Pagination>
              <PaginationContent className="flex items-center gap-2">
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(Math.max(currentPage - 1, 0))}
                    className={`cursor-pointer rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                      currentPage === 0
                        ? "pointer-events-none opacity-50"
                        : "hover:bg-gray-100"
                    }`}
                  />
                </PaginationItem>

                {getPageNumbers().map((pageNum, index) =>
                  pageNum === null ? (
                    <PaginationItem key={`ellipsis-${index}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={`page-${pageNum}`}>
                      <PaginationLink
                        onClick={() => setCurrentPage(pageNum)}
                        className={`cursor-pointer px-4 py-2 rounded-md transition-colors ${
                          currentPage === pageNum
                            ? "bg-[#003b5c] text-white font-medium shadow-md"
                            : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum + 1}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage(Math.min(currentPage + 1, npages - 1))
                    }
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

export default ClassicLandingPage;
