import styles from "./BloggerHome.module.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useRef, useEffect } from "react";
import { useMediaQuery } from "@mui/material";
import { IoMdCloseCircleOutline } from "react-icons/io";
import { FaFileUpload, FaUpload, FaCheckCircle } from "react-icons/fa";
import { FaRegPenToSquare } from "react-icons/fa6";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Home, Pen, Notebook } from "lucide-react";
import { IconButton } from "@mui/material";
import useBlogData from "@/hooks/use-blogdata";
import { blogTablecols } from "@/constants/blogTablecols";
import UserDropdown from "@/components/ui/profiledropdown";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
} from "@/components/ui/pagination";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { motion } from "framer-motion";

function BloggerHome() {
  const { data, fetchData } = useBlogData();
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery("(max-width:470px)");
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [fileName, setFileName] = useState("");
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const columns = blogTablecols;

  const handleIconButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
    }
  };

  const handleRemoveFile = () => {
    setFileName("");
    fileInputRef.current.value = "";
  };

  const handleUploadFile = () => {
    const file = fileInputRef.current.files[0];
    const formData = new FormData();
    formData.append("file", file);

    axios
      .post("http://localhost:8080/upload", formData, { withCredentials: true })
      .then(() => {
        setIsOpen(false);
        setTimeout(() => {
          toast({
            title: (
              <div className="flex items-center">
                <FaCheckCircle size={20} className="mr-2 text-green-500" />
                File Uploaded
              </div>
            ),
            description: `Your file, ${fileName}, has been uploaded successfully.`,
            variant: "success",
            className:
              "bg-[#084464] text-white font-['DM Sans'] border-none shadow-lg w-auto",
            duration: 3000,
            closeButtonClassName: "text-white",
          });
        }, 1000);
        fetchData();
      })
      .catch((error) => {
        console.error("File upload error:", error);
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          className:
            "bg-red-800 text-white font-['DM Sans'] border-none shadow-lg",
          description: "File upload failed. Please try again.",
        });
      })
      .finally(() => {
        handleRemoveFile();
      });
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 5,
      },
    },
  });

  useEffect(() => {
    table.setPageIndex(0);
  }, [data]);

  return (
    <div
      className={`${styles.BloggerHome} bg-gradient-to-br from-gray-50 to-gray-100`}
    >
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
          <UserDropdown userName={user.name} logout={logout} />
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-4 py-8">
        <div className="ml-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 rounded-full bg-gradient-to-r from-[#084464] to-[#1e6188]">
                <Home className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-semibold text-gray-900 leading-tight">
                Welcome back,{" "}
                <span className="bg-gradient-to-r from-[#084464] to-[#1A698F] text-transparent bg-clip-text">
                  {user.name}
                </span>
                !
              </h1>
            </div>
            <p className="text-gray-700 text-lg leading-relaxed">
              Craft new stories and manage your existing posts with ease.
            </p>
          </motion.div>
        </div>

        <div className="flex gap-6 ml-8 mt-10 mr-8">
          <div
            className={`relative flex flex-col flex-grow ${styles.card_transition}`}
          >
            <div className="absolute -top-5 left-6 overflow-visible z-10">
              <div className="w-14 h-14 bg-gradient-to-br from-[#003b5c] to-[#0a5a7c] rounded-full flex items-center justify-center shadow-lg">
                <Pen className="w-8 h-8 text-white" />
              </div>
            </div>
            <Card className="bg-white relative pt-8 shadow-lg h-[200px] hover:shadow-xl transition-shadow duration-300 overflow-hidden ease-in-out border-2 border-[#003b5c] flex flex-col">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#003b5c] opacity-5 rounded-bl-full"></div>
              <CardContent className="px-6 pb-6 flex flex-col justify-end mt-auto">
                <div>
                  <p className="text-sm text-gray-600">
                    Ready to start writing?
                  </p>
                  <button
                    className="mt-4 bg-[#084464] hover:bg-[#0a5a7c] text-white text-sm font-medium py-3 px-6 rounded-md transition-colors w-full flex items-center justify-center gap-2"
                    onClick={() => setIsOpen(true)}
                  >
                    <span className="flex items-center gap-2">
                      <FaRegPenToSquare />
                      <span>Start Writing</span>
                    </span>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div
            className={`relative flex flex-col flex-grow ${styles.card_transition}`}
          >
            <div className="absolute -top-5 left-6 overflow-visible z-10">
              <div className="w-14 h-14 bg-gradient-to-br from-[#003b5c] to-[#0a5a7c] rounded-full flex items-center justify-center shadow-lg">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
            </div>
            <Card
              className={`flex-grow bg-white relative pt-8 shadow-lg h-[200px] flex flex-col hover:shadow-xl overflow-hidden transition-shadow duration-300 ease-in-out border-2 border-[#003b5c]`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#003b5c] opacity-5 rounded-bl-full"></div>
              <CardContent className="px-6 pb-6 mt-auto flex flex-col justify-end">
                <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-100 opacity-80">
                  <h2 className="text-base font-medium text-gray-500 mb-1">
                    Total Posts
                  </h2>
                  <p className="text-4xl font-bold text-[#003b5c]">
                    {data.length}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          <div
            className={`relative flex flex-col flex-grow ${styles.card_transition}`}
          >
            <div className="absolute -top-5 left-6 overflow-visible z-10">
              <div className="w-14 h-14 bg-gradient-to-br from-[#003b5c] to-[#0a5a7c] rounded-full flex items-center justify-center shadow-lg">
                <Notebook className="w-8 h-8 text-white" />
              </div>
            </div>
            <Card
              className={`flex-grow bg-white relative pt-8 shadow-lg h-[200px] flex flex-col hover:shadow-xl transition-shadow duration-300 ease-in-out border-2 border-[#003b5c]`}
            >
              <div className="absolute -top-5 left-6">
                <div className="w-14 h-14 bg-gradient-to-br from-[#003b5c] to-[#0a5a7c] rounded-full flex items-center justify-center shadow-lg">
                  <Notebook className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#003b5c] opacity-5 rounded-bl-full"></div>
              <CardContent className="px-6 pb-6 mt-auto flex flex-col justify-end">
                <h3 className="text-lg font-semibold text-[#003b5c]">
                  Your Blog
                </h3>
                <a
                  href={`http://localhost:5173/${user.name}`}
                  className="mt-4 bg-[#084464] hover:bg-[#0a5a7c] text-white text-sm font-medium py-3 px-4 rounded-md transition-colors flex items-center justify-center"
                >
                  Visit Blog
                </a>
              </CardContent>
            </Card>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-white shadow-lg rounded-lg p-6 ml-8 mr-8 mt-12 h-auto w-auto overflow-x-auto mb-12 hover:shadow-xl transition-shadow duration-300 ease-in-out border-2 border-[#003b5c]">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-[#003b5c] inline-flex items-center gap-2 whitespace-nowrap">
                <Notebook className="h-6 w-6" />
                My Blog Posts
                <span className="text-sm bg-[#003b5c] text-white px-3 py-1 rounded-full">
                  {data.length}
                </span>
              </h1>

              <div className="text-sm text-gray-600 bg-gray-100 px-4 py-2 rounded-lg">
                Showing {table.getRowModel().rows.length} of {data.length} posts
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="table-auto min-w-full divide-y divide-gray-200 overflow-hidden">
                <thead className="bg-gradient-to-r from-[#003b5c] to-[#0a5a7c]">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {table.getRowModel().rows.map((row, index) => (
                    <tr
                      key={row.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        index % 2 === 0 ? "bg-gray-50" : "bg-white"
                      }`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-center items-center mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => {
                        if (table.getCanPreviousPage()) {
                          return table.previousPage();
                        }
                      }}
                      className={`cursor-pointer ${
                        !table.getCanPreviousPage()
                          ? "cursor-not-allowed opacity-50"
                          : ""
                      }`}
                    />
                  </PaginationItem>
                  {Array.from({ length: table.getPageCount() }, (_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        onClick={() => table.setPageIndex(i)}
                        isActive={table.getState().pagination.pageIndex === i}
                        className={`cursor-pointer px-4 py-2 rounded-md transition-colors ${
                          table.getState().pagination.pageIndex === i
                            ? "bg-[#003b5c] text-white font-medium shadow-md"
                            : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => {
                        if (table.getCanNextPage()) {
                          return table.nextPage();
                        }
                      }}
                      className={`cursor-pointer ${
                        !table.getCanNextPage()
                          ? "cursor-not-allowed opacity-50"
                          : ""
                      }`}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        </motion.div>
      </main>

      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) setFileName("");
        }}
      >
        <DialogContent className="sm:max-w-[450px] rounded-xl p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-[#003b5c] to-[#0a5a7c] p-6 text-white">
            <DialogHeader>
              <DialogTitle className="text-center text-3xl font-bold font-['DM Sans']">
                Upload a Markdown File
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-8 flex flex-col items-center justify-center">
            <div className="mb-6 bg-gray-50 p-8 rounded-full">
              <IconButton
                aria-label="upload"
                className="text-9xl text-[#084464] hover:text-[#0a5a7c] transition-colors"
                onClick={handleIconButtonClick}
              >
                <FaFileUpload size={80} />
              </IconButton>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
            />
            {!fileName && (
              <p className="mt-1 text-base font-['DM Sans'] text-gray-500">
                Select a file to upload
              </p>
            )}
            {fileName && (
              <p className="mt-1 text-base font-['DM Sans'] text-gray-500">
                {fileName}
              </p>
            )}
            {fileName && (
              <div className="flex gap-4 mt-6 w-full">
                <button
                  onClick={() => {
                    handleUploadFile();
                  }}
                  className="text-sm font-['DM Sans'] bg-gradient-to-r from-[#084464] to-[#0a5a7c] text-white rounded-lg px-6 py-3 hover:shadow-lg transition-all flex-1 flex items-center justify-center"
                >
                  <FaUpload size={16} className="mr-2" />
                  Upload File
                </button>

                <button
                  onClick={handleRemoveFile}
                  className="text-sm font-['DM Sans'] bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg px-6 py-3 hover:shadow-lg transition-all flex-1 flex items-center justify-center"
                >
                  <IoMdCloseCircleOutline size={19} className="mr-1" />
                  Remove File
                </button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default BloggerHome;
