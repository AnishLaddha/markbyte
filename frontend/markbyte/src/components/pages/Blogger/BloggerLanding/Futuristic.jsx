/* Futuristic Landing Page Component */
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
} from "@/components/ui/pagination";
import { useNavigate } from "react-router-dom";
import { AnimatedGridPattern } from "@/components/magicui/animated-grid-pattern";
import { cn } from "@/lib/utils";

function FuturisticLandingPage({
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

  // Generate a random icon for each post
  const iconOptions = [
    <Hexagon key="hexagon" className="h-10 w-10" />,
    <Layers key="layers" className="h-10 w-10" />,
    <Zap key="zap" className="h-10 w-10" />,
  ];

  const memoizedIcons = React.useMemo(
    () =>
      blogList.map(
        () => iconOptions[Math.floor(Math.random() * iconOptions.length)]
      ),
    [blogList]
  );

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#170B2B] via-[#0F2A3D] to-[#0B3B30] text-white overflow-x-hidden flex flex-col">
      <div className="w-full bg-[#0A1A20]/80 py-20 relative overflow-hidden border-b border-[#4A97FF]/20">
        <div className="absolute inset-0 bg-gradient-to-r from-[#6A3AFF]/10 via-[#00FDCF]/10 to-[#34DA9D]/10"></div>
        <div className="absolute inset-0 overflow-hidden">
          {/* Animated Grid Background */}
          <div className="absolute inset-0 h-full w-full overflow-hidden pointer-events-none">
            <AnimatedGridPattern
              numSquares={20}
              maxOpacity={0.1}
              duration={3}
              repeatDelay={1}
              className={cn(
                "[mask-image:radial-gradient(700px_circle_at_center,white,transparent)]",
                "inset-x-0 inset-y-[-30%] h-[200%] skew-y-12"
              )}
            />
          </div>
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
                <div className="absolute -inset-1 bg-gradient-to-r from-[#6A3AFF] via-[#00FDCF] to-[#34DA9D] rounded-full blur-sm opacity-70"></div>
                <Avatar className="h-32 w-32 border-2 border-[#00FDCF]/50 shadow-xl relative">
                  <AvatarImage
                    loading="lazy"
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
      <main className="container mx-auto mt-16 px-8 mb-24 relative z-10 flex-grow">
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

        {/* Blog Posts Grid */}
        <div className="space-y-10">
          {blogList.length == 0 && (
            <div className="opacity-100">
              <Card className="w-full py-20 bg-[#1A2E45]/50 border border-[#4A97FF]/20 rounded-xl shadow-xl">
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
              transition={{ duration: 0.8 }}
              className="grid md:grid-cols-2 gap-8"
            >
              {blogList
                .slice(currentPage * nposts, (currentPage + 1) * nposts)
                .map((post, index) => (
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
                            {memoizedIcons[index]}
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
                        : "bg-[#1A2E45] border border-[#4A97FF]/30 hover:bg-[#2A4060] text-white"
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
                        : "bg-[#1A2E45] border border-[#4A97FF]/30 hover:bg-[#2A4060] text-white"
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
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#6A3AFF] via-[#00FDCF] to-[#34DA9D]"></div>
    </div>
  );
}

export default FuturisticLandingPage;
