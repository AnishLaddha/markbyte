/* This is the discover page where readers/bloggers can discover new and popular blog posts. */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardHeader from "@/components/ui/dashboardheader";
import NoAuthDashboardHeader from "@/components/ui/noauthheader";
import { useAuth } from "@/contexts/AuthContext";
import useDiscoverNew from "@/hooks/use-discovernew";
import useDiscoverTop from "@/hooks/use-discovertop";
import {
  TrendingUp,
  MessageSquarePlus,
  Compass,
  Eye,
  ArrowRight,
  CalendarIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";
import { Avatar, AvatarImage } from "@/components/ui/avatar";

function Discover() {
  const { isAuthenticated } = useAuth();
  const [view, setView] = useState("popular");
  const [currentPage, setCurrentPage] = useState(0);
  const nposts = 6;
  const [npages, setNPages] = useState(0);

  // Format date function
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  // Fetches top and new posts from hooks
  const { topPosts: popularContent } = useDiscoverTop();
  const { newPosts: newContent } = useDiscoverNew();
  let blogList = [];

  if (!newContent && !popularContent) {
    blogList = [];
  } else {
    blogList = view === "popular" ? popularContent : newContent;
  }

  // Calculate total pages whenever blogList changes
  useEffect(() => {
    setNPages(Math.ceil((blogList?.length || 0) / nposts));
  }, [blogList, nposts]);

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
    <div className="discover relative min-h-screen overflow-x-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      {isAuthenticated ? <DashboardHeader /> : <NoAuthDashboardHeader />}

      <main className="container mx-auto px-4 sm:px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between mx-4 sm:mx-8 mb-4">
          <div className="mb-6 sm:mb-0 gap-4 items-center">
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="
                text-4xl sm:text-5xl font-bold text-[#084464]
                flex items-center relative inline-block
              "
            >
              Disc
              <motion.div
                initial={{ opacity: 0, rotate: -180 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: -180 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="inline-flex items-center justify-center"
              >
                <Compass className="h-7 w-7 sm:h-9 sm:w-9 text-[#084464] mx-0.5" />
              </motion.div>
              ver
            </motion.h2>

            <p className="text-gray-500 text-lg sm:text-xl">
              Explore the latest and most popular blog posts from our community.
            </p>
            <motion.div
              className="h-1 w-24 bg-gradient-to-r from-[#084464] to-[#1A698F] rounded-full mt-2"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 96, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            />
          </div>

          <div className="flex flex-row space-x-4 bg-white p-1.5 rounded-full shadow-sm border border-gray-200">
            <button
              onClick={() => {
                setView("popular");
                setCurrentPage(0);
              }}
              className={`
                rounded-full
                px-5 py-2.5
                font-medium
                flex items-center
                transition-all duration-300 ease-in-out
                ${
                  view === "popular"
                    ? "bg-[#084464] text-white shadow-md"
                    : "bg-transparent text-[#084464] hover:bg-gray-100"
                }
                `}
            >
              <TrendingUp className="inline-block mr-2 h-4 w-4" />
              Popular
            </button>

            <button
              onClick={() => {
                setView("new");
                setCurrentPage(0);
              }}
              className={`
                rounded-full
                px-5 py-2.5
                font-medium
                flex items-center
                transition-all duration-300 ease-in-out
                ${
                  view === "new"
                    ? "bg-[#084464] text-white shadow-md"
                    : "bg-transparent text-[#084464] hover:bg-gray-100"
                }
                `}
            >
              <MessageSquarePlus className="inline-block mr-2 h-4 w-4" />
              New
            </button>
          </div>
        </div>
        
        {/* Blog posts grid */}
        <AnimatePresence mode="wait">
          {blogList && blogList.length > 0 ? (
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mx-8 mt-8"
            >
              {blogList
                .slice(currentPage * nposts, (currentPage + 1) * nposts)
                .map((post, index) => (
                  <motion.div
                    key={
                      post.blog.user + post.blog.title + post.blog.date_uploaded
                    }
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="h-full"
                  >
                    <Card
                      className="bg-white border-0 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer h-full flex flex-col overflow-hidden"
                      onClick={() => {
                        if (!post.blog.link) return;
                        const url = post.blog.link.includes("static")
                          ? post.blog.link
                          : post.blog.direct_link;
                        window.open(url, "_blank");
                      }}
                    >
                      <div className="h-2 bg-[#084464]/10 group-hover:bg-[#084464] transition-colors duration-300" />
                      <CardContent className="p-6 flex flex-col flex-grow">
                        <h3 className="text-xl font-bold mb-4 text-gray-800 group-hover:text-[#084464] transition-colors duration-300 line-clamp-2">
                          {post.blog.title}
                        </h3>
                        <div className="mt-auto">
                          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                            <div className="flex items-center">
                              <Avatar
                                className="h-8 w-8 shadow-xl cursor-pointer mr-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(
                                    `/${post.blog.user}`,
                                    "_blank"
                                  );
                                }}
                              >
                                <AvatarImage
                                  src={
                                    post.pfp
                                      ? `${post.pfp}`
                                      : `https://api.dicebear.com/9.x/initials/svg?seed=${usersName}&backgroundType=gradientLinear`
                                  }
                                  alt="Profile preview"
                                  className="object-cover w-full h-full"
                                />
                              </Avatar>
                              <span
                                className="hover:text-[#084464] hover:underline cursor-pointer text-md"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(
                                    `/${post.blog.user}`,
                                    "_blank"
                                  );
                                }}
                              >
                                {post.blog.user}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Eye className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                              <span>{post.view_count}</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-sm text-gray-500">
                              <CalendarIcon className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                              {formatDate(post.blog.date_uploaded)}
                            </div>
                            <div className="flex items-center font-medium text-[#084464]">
                              Read <ArrowRight className="ml-1.5 h-4 w-4" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
            </motion.div>
          ) : (
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center py-16 text-center mx-8 mt-8"
            >
              <Compass className="h-16 w-16 text-[#084464]/30 mb-4" />
              <h3 className="text-xl font-medium text-gray-700 mb-2">
                No posts found
              </h3>
              <p className="text-gray-500 max-w-md">
                There are no posts available in this category at the moment.
                Check back later or try a different category.
              </p>
            </motion.div>
          )}

          {/* Pagination controls */}
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
        </AnimatePresence>
      </main>
    </div>
  );
}

export default Discover;
