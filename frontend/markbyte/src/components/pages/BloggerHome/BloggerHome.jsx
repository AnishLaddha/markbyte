import styles from "./BloggerHome.module.css";
import { useNavigate } from "react-router-dom";
import { CiLogout } from "react-icons/ci";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useRef, useEffect } from "react";
import { useMediaQuery } from "@mui/material";
import { IoMdCloseCircleOutline } from "react-icons/io";
import {
  FaFileUpload,
  FaUpload,
  FaCheckCircle,
} from "react-icons/fa";
import { FaRegPenToSquare } from "react-icons/fa6";
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
      .post("http://localhost:8080/upload", formData, {withCredentials: true})
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
    }

  });

  useEffect(() => {
    table.setPageIndex(0);
  }, [data]);


  return (
    <div className={styles.BloggerHome}>
      <header className={styles.header2}>
        <div className={styles.logoContainer} onClick={() => navigate("/")}>
          <img
            src="src/assets/markbytealt.png"
            alt="MarkByte Logo"
            className={styles.pageLogo2}
          />
          {!isSmallScreen && (
            <span className={styles.logoText2}>
              arkByte <span className="text-3xl transform scale-y-150">|</span>
              Dashboard
            </span>
          )}
        </div>
        <div style={{ display: "flex" }}>
          <button className={`${styles.loginButton} relative`} onClick={logout}>
            Logout &nbsp;
            <CiLogout />
          </button>
        </div>
      </header>
      <div className="welcome-card bg-white p-6 rounded-lg shadow-lg max-w-sm ml-8 mt-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4 border-b pb-2">
          Hello, {user.name}.
        </h2>
        <p className="text-lg text-gray-600">Ready to start writing? ✍️</p>
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
      <h1 className="text-2xl font-semibold text-[#003b5c] ml-8 mt-12">
        My Blogs
      </h1>
      <hr className="mt-2 mx-8 border-t border-gray-300" />
      <div className="mt-8 mx-8">
        <table className="table-auto w-full border-collapse border rounded-lg shadow-lg">
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
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-center items-center mt-4 gap-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => {
                    if (table.getCanPreviousPage()) {
                      return table.previousPage()
                    } 
                  }}
                  className={`cursor-pointer ${!table.getCanPreviousPage() ? 'cursor-not-allowed opacity-50' : ''}`}
                />
              </PaginationItem>
              {Array.from({ length: table.getPageCount() }, (_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    onClick={() => table.setPageIndex(i)}
                    isActive={table.getState().pagination.pageIndex === i}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => {
                    if (table.getCanNextPage()) {
                      return table.nextPage()
                    }
                  }}
                  className={`cursor-pointer ${!table.getCanNextPage() ? 'cursor-not-allowed opacity-50' : ''}`}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
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
