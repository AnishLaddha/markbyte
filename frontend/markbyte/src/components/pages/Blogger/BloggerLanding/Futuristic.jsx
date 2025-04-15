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
  Zap,
  Layers,
  Hexagon,
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

function FuturisticLandingPage({
  username,
  blogList,
  profilepicture,
  error,
  fetchPosts,
}) {
  const nposts = 5;
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
    const pages = [];
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

  // Generate a random icon for each post
  const getRandomIcon = (index) => {
    const icons = [
      <Hexagon key="hexagon" className="h-10 w-10" />,
      <Layers key="layers" className="h-10 w-10" />,
      <Zap key="zap" className="h-10 w-10" />,
    ];
    return icons[Math.floor(Math.random() * icons.length)];
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#170B2B] via-[#0F2A3D] to-[#0B3B30] text-white overflow-x-hidden">
      <div className="w-full bg-[#0A1A20]/80 backdrop-blur-lg py-20 relative overflow-hidden border-b border-[#4A97FF]/20">
        <div className="absolute inset-0 bg-gradient-to-r from-[#6A3AFF]/10 via-[#00FDCF]/10 to-[#34DA9D]/10"></div>
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-moveLeftRight h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent w-full opacity-30"
              style={{
                top: `${20 + i * 15}%`,
                left: 0,
                animationDuration: `${3 + i * 0.5}s`,
                animationDelay: `${i * 0.2}s`,
              }}
            ></div>
          ))}
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-moveTopBottom w-px bg-gradient-to-b from-transparent via-indigo-500 to-transparent h-full opacity-30"
              style={{
                left: `${20 + i * 15}%`,
                top: 0,
                animationDuration: `${3 + i * 0.5}s`,
                animationDelay: `${i * 0.2}s`,
              }}
            ></div>
          ))}
        </div>

        <div className="container mx-auto px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-left mb-10 ml-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-8"
          >
            <div className="flex items-center gap-8">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#6A3AFF] via-[#00FDCF] to-[#34DA9D] rounded-full blur-sm opacity-70 animate-pulse"></div>
                <Avatar className="h-32 w-32 border-2 border-[#00FDCF]/50 shadow-xl relative">
                  <AvatarImage
                    src={
                      profilepicture ||
                      `https://api.dicebear.com/9.x/initials/svg?seed=${
                        username || "User"
                      }&backgroundType=gradientLinear`
                    }
                    alt={username}
                    className="object-cover w-full h-full"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-[#6A3AFF] to-[#34DA9D] text-white text-2xl">
                    {username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
                  {username}'s{" "}
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#6A3AFF] via-[#00FDCF] to-[#34DA9D]">
                    Blog
                  </span>
                </h1>
                <p className="text-xl md:text-2xl max-w-2xl text-[#B4EFD6] font-light">
                  Explore {username}'s blog posts and articles.
                </p>
              </div>
            </div>

            <div className="flex flex-row items-center gap-4">
              <button
                className="bg-gradient-to-r from-[#6A3AFF] to-[#34DA9D] hover:opacity-90 rounded-full p-3 shadow-lg shadow-emerald-500/20 transition-all duration-300 ease-in-out flex items-center justify-center text-white"
                onClick={() => {
                  navigate("/");
                }}
              >
                <Home className="h-6 w-6 text-white" />
              </button>
              <button
                className="px-6 py-3 text-lg font-medium text-white bg-[#1A2E45] hover:bg-[#2A4060] border border-[#4A97FF]/30 rounded-lg shadow-lg shadow-indigo-500/10 transition-all duration-300 ease-in-out flex items-center"
                onClick={() => {
                  navigate(`/${username}/about`);
                }}
              >
                <User2 className="mr-2 text-[#00FDCF]" /> About
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto mt-16 px-8 mb-24 relative z-10">
        <div className="flex items-center justify-between mb-16">
          <h2 className="text-4xl font-bold text-white flex items-center">
            <Globe className="h-8 w-8 mr-3 text-[#00FDCF]" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#6A3AFF] via-[#00FDCF] to-[#34DA9D]">
              Table of Contents
            </span>
          </h2>
          <div className="flex items-center text-sm text-[#B4EFD6]">
            <Bookmark className="h-4 w-4 mr-2 text-[#00FDCF]" />
            {blogList?.length || 0} Posts
          </div>
        </div>

        {/* Blog Posts List */}
        <div className="space-y-10">
          {blogList.length == 0 && (
            <div className="opacity-100">
              <Card className="w-full py-20 bg-[#1A2E45]/50 backdrop-blur-sm border border-[#4A97FF]/20 rounded-xl shadow-xl">
                <CardContent className="text-center">
                  <div className="flex flex-col items-center">
                    <div className="rounded-full bg-[#2A4060] p-8 mb-6 border border-[#4A97FF]/30 shadow-lg shadow-indigo-500/20">
                      <Bookmark className="h-14 w-14 text-[#00FDCF]" />
                    </div>
                    <h3 className="text-2xl font-medium text-white mb-3">
                      No posts yet
                    </h3>
                    <p className="text-[#B4EFD6] max-w-md text-lg">
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
                      className="overflow-hidden border border-[#4A97FF]/20 bg-[#1A2E45]/50 backdrop-blur-sm hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 group cursor-pointer rounded-xl"
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
                          <div className="flex items-center text-sm text-[#B4EFD6]">
                            <CalendarIcon className="h-4 w-4 mr-1 text-[#00FDCF]" />
                            {formatDate(post.post.date_uploaded)}
                          </div>
                          <div className="flex items-center text-sm text-[#B4EFD6]">
                            <Eye className="h-4 w-4 mr-1 text-[#00FDCF]" />
                            <span>{post.views.length} views</span>
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <div className="bg-[#2A4060]/50 p-4 rounded-lg border border-[#4A97FF]/30">
                            <div className="text-[#00FDCF]">
                              {getRandomIcon(index)}
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#00FDCF] transition-colors duration-300">
                              {post.post.title}
                            </h3>

                            <div className="flex items-center text-[#00FDCF] font-medium group-hover:text-[#34DA9D] transition-colors duration-300">
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
                    onClick={() => setCurrentPage(Math.max(currentPage - 1, 0))}
                    className={`cursor-pointer rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                      currentPage === 0
                        ? "pointer-events-none opacity-50"
                        : "bg-[#1A2E45] border border-[#4A97FF]/30 hover:bg-[#2A4060] text-white"
                    }`}
                  />
                </PaginationItem>

                {getPageNumbers().map((pageNum, index) =>
                  pageNum === null ? (
                    <PaginationItem key={`ellipsis-${index}`}>
                      <PaginationEllipsis className="text-[#00FDCF]" />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={`page-${pageNum}`}>
                      <PaginationLink
                        onClick={() => setCurrentPage(pageNum)}
                        className={`cursor-pointer px-4 py-2 rounded-md transition-colors ${
                          currentPage === pageNum
                            ? "bg-gradient-to-r from-[#6A3AFF] to-[#34DA9D] text-white font-medium shadow-md shadow-emerald-500/20"
                            : "bg-[#1A2E45] border border-[#4A97FF]/30 text-white hover:bg-[#2A4060]"
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
                        : "bg-[#1A2E45] border border-[#4A97FF]/30 hover:bg-[#2A4060] text-white"
                    }`}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </main>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#6A3AFF] via-[#00FDCF] to-[#34DA9D]"></div>
    </div>
  );
}

export default FuturisticLandingPage;
