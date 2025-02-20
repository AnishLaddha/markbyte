import styles from "./BloggerHome.module.css";
import { useNavigate } from "react-router-dom";
import { CiLogout } from "react-icons/ci";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useRef, useEffect } from "react";
import { useMediaQuery } from "@mui/material";
import { IoMdCloseCircleOutline } from "react-icons/io";
import { FaFileUpload, FaUpload, FaCheckCircle } from "react-icons/fa";
import { FaRegPenToSquare } from "react-icons/fa6";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Home, Pen } from "lucide-react";
import { IconButton } from "@mui/material";
import useBlogData from "@/hooks/use-blogdata";
import { blogTablecols } from "@/constants/blogTablecols";
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

function BloggerHome() {
  const { data, fetchData } = useBlogData();
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery("(max-width:470px)");
  const { isAuthenticated, user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [fileName, setFileName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const columns = blogTablecols;

  const handleIconButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log("File selected:", file);
      setFileName(file.name);
    }
  };

  const handleRemoveFile = () => {
    setFileName("");
    fileInputRef.current.value = "";
  };

  const handleUploadFile = () => {
    setIsLoading(true);
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
            position: "bottom-right",
            className:
              "bg-[#084464] text-white font-['DM Sans'] border-none shadow-lg",
            duration: 4000,
          });
        }, 1000);
        fetchData();
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
    <div className={styles.BloggerHome}>
      <header className={styles.header2}>
        <div className="flex items-center cursor-pointer" onClick={() => navigate("/")}>
          <img
            src="src/assets/markbytealt.png"
            alt="MarkByte Logo"
            className={styles.pageLogo2}
          />
          {!isSmallScreen && <span className={styles.logoText2}>arkByte</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <button className={`${styles.loginButton} relative px-4 py-2 rounded-md hover:bg-gray-100 transition-all`} onClick={logout}>
            Logout &nbsp;
            <CiLogout />
          </button>
        </div>
      </header>

      <main className="container mx-4">
        <div className="mt-8 ml-12">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Home className="h-8 w-8 text-[#084464]" />
            Welcome back, {user.name}!
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your blog posts and start writing new ones
          </p>
        </div>

        <div className="flex gap-6 ml-12 mt-10">
          <Card className="w-[240px] bg-white relative pt-8 shadow-lg h-[200px] flex flex-col hover:shadow-xl transition-shadow">
            <div className="absolute -top-5 left-6">
              <div className="w-14 h-14 bg-gradient-to-br from-[#003b5c] to-[#0a5a7c] rounded-full flex items-center justify-center shadow-lg">
                <Pen className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardContent className="px-6 pb-6 mt-auto flex flex-col justify-end">
              <div>
                <p className="text-sm text-gray-600">
                  Ready to start writing?
                </p>
                <button
                  className="bg-[#084464] text-white px-6 py-3 rounded-lg mt-4 hover:bg-[#0a5a7c] transition-all duration-300 ease-in-out shadow-lg transform hover:scale-105"
                  onClick={() => setIsOpen(true)}
                >
                  <span className="flex items-center space-x-2">
                    <FaRegPenToSquare />
                    <span>Start Writing</span>
                  </span>
                </button>
              </div>
            </CardContent>
          </Card>

          <Card className="w-[240px] bg-white relative pt-8 shadow-lg h-[200px] flex flex-col hover:shadow-xl transition-shadow">
            <div className="absolute -top-5 left-6">
              <div className="w-14 h-14 bg-gradient-to-br from-[#003b5c] to-[#0a5a7c] rounded-full flex items-center justify-center shadow-lg">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardContent className="px-6 pb-6 mt-auto flex flex-col justify-end">
              <h2 className="text-base font-medium text-gray-500 mb-1">
                Total Posts
              </h2>
              <p className="text-3xl font-semibold text-[#003b5c]">
                {data.length}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6 ml-12 mt-12 h-auto w-auto overflow-x-auto mb-12 hover:shadow-xl transition-shadow">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-[#003b5c] flex items-center gap-2 border-b-2 border-[#003b5c] pb-2 w-fit">
              My Blogs
            </h1>
            <div className="flex justify-end">
              Showing {table.getRowModel().rows.length} of {data.length} blogs
            </div>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="table-auto w-full border-collapse border-gray-500 rounded-md shadow-sm overflow-hidden">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="border border-gray-300 px-4 py-2 bg-[#003b5c] text-white font-semibold"
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
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border border-gray-300 hover:bg-gray-100"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="border border-gray-300 px-4 py-2"
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

          {/* Pagination Section */}
          <div className="flex justify-center items-center mt-6 gap-4">
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
                      className="cursor-pointer bg-[#003b5c] text-white px-4 py-2 rounded-md"
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
      </main>

      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) setFileName("");
        }}
      >
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="text-center text-4xl font-bold font-['DM Sans'] mb-2">
              Upload a Markdown File
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center">
            <IconButton
              aria-label="upload"
              className="text-9xl text-[#084464]"
              onClick={handleIconButtonClick}
            >
              <FaFileUpload size={80} />
            </IconButton>
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
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => {
                    handleUploadFile();
                  }}
                  className="text-sm font-['DM Sans'] bg-[#084464] text-white rounded-md px-3 py-2 hover:bg-[#005a7a] flex items-center"
                >
                  <FaUpload size={15} className="mr-2" />
                  <div className="w-[1px] bg-white mr-2 self-stretch" />
                  Upload File
                </button>

                <button
                  onClick={handleRemoveFile}
                  className="text-sm font-['DM Sans'] bg-red-500 text-white rounded-md px-3 py-2 hover:bg-red-600 flex items-center"
                >
                  <IoMdCloseCircleOutline size={15} className="mr-2" />
                  <div className="w-[0.5px] bg-white mr-2 self-stretch" />
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
