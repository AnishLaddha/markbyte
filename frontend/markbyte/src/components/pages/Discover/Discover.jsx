import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DashboardHeader from "@/components/ui/dashboardheader";
import NoAuthDashboardHeader from "@/components/ui/noauthheader";
import { useAuth } from "@/contexts/AuthContext";
import {
  TrendingUp,
  MessageSquarePlus,
  Compass,
  Eye,
  ArrowRight,
  CalendarIcon,
  User
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";

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

  // Sample data for popular content
  const popularContent = [
    {
      post: {
        title: "Understanding React Hooks",
        user: "jane_smith",
        date_uploaded: "2023-04-15T10:30:00Z",
        link: "static/blog/understanding-react-hooks",
        direct_link: "https://example.com/blog/understanding-react-hooks",
      },
      views: Array(1204).fill(0),
      date_uploaded: "2023-04-15T10:30:00Z",
    },
  ];

  // Sample data for new content
  const newContent = [
    {
      post: {
        title: "Getting Started with React Server Components",
        user: "emily_johnson",
        date_uploaded: "2023-04-16T18:30:00Z",
        link: "static/blog/react-server-components",
        direct_link: "https://example.com/blog/react-server-components",
      },
      views: Array(342).fill(0),
      date_uploaded: "2023-04-16T18:30:00Z",
    },
  ];

  const blogList = view === "popular" ? popularContent : newContent;

  // Calculate total pages whenever blogList changes
  useEffect(() => {
    setNPages(Math.ceil((blogList?.length || 0) / nposts));
  }, [blogList, nposts]);

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
    <div className="discover relative min-h-screen overflow-x-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      {isAuthenticated ? <DashboardHeader /> : <NoAuthDashboardHeader />}

      <main className="container mx-auto px-4 sm:px-4 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between mx-4 sm:mx-8 mb-4">
          <div className="mb-6 sm:mb-0 gap-4 items-center">
            <h2
              className="
                text-4xl sm:text-5xl font-bold text-[#084464]
                flex items-center relative inline-block
            "
            >
              Disc
              <Compass className="h-8 w-8 sm:h-10 sm:w-10 text-[#084464] mx-0.5" />
              ver
            </h2>
            <p className="text-gray-500 text-lg sm:text-xl">
                Explore the latest and most popular blog posts from our community.
            </p>
          </div>

          <div className="flex flex-row space-x-4 bg-white p-1.5 rounded-full shadow-sm border border-gray-200">
            <button
              onClick={() => {
                setView("popular")
                setCurrentPage(0)
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
                setView("new")
                setCurrentPage(0)
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

        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {blogList && blogList.length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mx-8 mt-8">
                {blogList.slice(currentPage * nposts, (currentPage + 1) * nposts).map((post, index) => {
                  return (
                    <motion.div
                      key={post.post.user + post.post.title + post.date_uploaded}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                    >
                      <Card
                        className="bg-white border-0 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer h-full flex flex-col overflow-hidden"
                        onClick={() => {
                          console.log("check!")
                          if (post.post.link.includes("static")) {
                            window.open(post.post.link, "_blank")
                          } else {
                            window.open(post.post.direct_link, "_blank")
                          }
                        }}
                      >
                        <CardContent className="p-6 flex flex-col flex-grow">
                          <h3 className="text-xl font-bold mb-4 text-gray-800 group-hover:text-[#084464] transition-colors duration-300 line-clamp-2">
                            {post.post.title}
                          </h3>

                          <div className="mt-auto">
                            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                              <div className="flex items-center">
                                <User className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                                <span>{post.post.user}</span>
                              </div>
                              <div className="flex items-center">
                                <Eye className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                                <span>{post.views.length}</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center text-sm text-gray-500">
                                <CalendarIcon className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                                {formatDate(post.post.date_uploaded)}
                              </div>

                              <div className="flex items-center font-medium text-[#084464]">
                                Read <ArrowRight className="ml-1.5 h-4 w-4" />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

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
      </main>
    </div>
  );
}

export default Discover;
