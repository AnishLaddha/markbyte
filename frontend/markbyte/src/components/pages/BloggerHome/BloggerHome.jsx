import styles from "./BloggerHome.module.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useRef, useEffect, useMemo } from "react";
import { useMediaQuery } from "@mui/material";
import { IoMdCloseCircleOutline } from "react-icons/io";
import React from "react";
import {
  FaFileUpload,
  FaUpload,
  FaCheckCircle,
  FaExternalLinkAlt,
  FaFile,
} from "react-icons/fa";
import { FaRegPenToSquare } from "react-icons/fa6";
import { Card, CardContent } from "@/components/ui/card";
import {
  Home,
  Pen,
  Notebook,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { IconButton } from "@mui/material";
import useBlogData from "@/hooks/use-blogdata";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { Input } from "@/components/ui/input";

import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { motion } from "framer-motion";
import { FaCss3 } from "react-icons/fa";

function BloggerHome() {
  const { data, fetchData } = useBlogData();
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery("(max-width:470px)");
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [fileName, setFileName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const [selectedVersions, setSelectedVersions] = useState({});
  const [isalertOpen, setIsAlertOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState("");

  useEffect(() => {
    setSelectedVersions(
      data.reduce((acc, row) => {
        acc[row.title] = row.latestVersion;
        return acc;
      }, {})
    );
  }, [data]);

  const blogTablecols = [
    {
      accessorKey: "title",
      header: "Blog Post Name",
    },
    {
      accessorKey: "date",
      header: "Date Published",
      cell: ({ getValue }) => {
        const date = new Date(getValue());
        return isNaN(date) ? "Invalid Date" : date.toLocaleDateString();
      },
    },
    {
      accessorKey: "link",
      header: "Link",
      cell: ({ getValue }) => (
        <a
          href={getValue()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center"
        >
          View Post <FaExternalLinkAlt className="ml-2" />
        </a>
      ),
    },
    {
      accessorKey: "versionAndPublish",
      header: "Version",
      cell: ({ row }) => {
        const rowId = row.original.id || row.original.title;

        // Get selected version from parent state
        const selectedVersion =
          selectedVersions[rowId] || row.original.latestVersion;

        return (
          <div>
            <Select
              value={selectedVersion}
              onValueChange={(value) =>
                setSelectedVersions((prev) => ({
                  ...prev,
                  [rowId]: value,
                }))
              }
              className="w-auto px-1 py-1 border rounded-lg"
            >
              <SelectTrigger>
                <SelectValue placeholder="Select version" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Version</SelectLabel>
                  {(Array.isArray(row.original.version)
                    ? row.original.version
                    : [row.original.version]
                  ).map((version) => (
                    <SelectItem key={version} value={version}>
                      {version}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        );
      },
    },
    {
      accesorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const rowId = row.original.id || row.original.title;
        const selectedVersion =
          selectedVersions[rowId] || row.original.latestVersion;
        const showPublishButton =
          selectedVersion !== row.original.latestVersion;
        return (
          <div>
            {showPublishButton ? (
              <button
                className="px-4 py-1.5 bg-[#084464] text-white text-sm font-medium rounded-md
                         hover:bg-[#0a5a7c] active:bg-[#063850]
                         transition-all duration-200 ease-in-out
                         shadow-sm hover:shadow-md"
                onClick={() => {
                  axios
                    .post(
                      "http://localhost:8080/publish",
                      {
                        username: user.name,
                        title: row.original.title,
                        version: selectedVersion,
                      },
                      { withCredentials: true }
                    )
                    .then(() => {
                      fetchData();
                      toast({
                        variant: "default",
                        title: "Version Published Successfully",
                        description: `Version ${selectedVersion} of "${row.original.title}" has been published.`,
                        action: (
                          <FaCheckCircle size={30} className="text-white" />
                        ),
                        className:
                          "bg-[#084464] text-white font-['DM Sans'] border-none shadow-lg w-auto backdrop-blur-md transition-all duration-300 ease-in-out",
                        duration: 3000,
                      });
                    });
                }}
              >
                Publish
              </button>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Current Version
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "edit",
      header: "Edit",
      cell: ({ row }) => {
        const rowId = row.original.id || row.original.title;
        const selectedVersion =
          selectedVersions[rowId] || row.original.latestVersion;
        return (
          <button
            className="inline-flex items-center justify-center p-2 rounded-full bg-indigo-50 text-[#084464] hover:bg-indigo-100 hover:text-[#0a5a7c] transition-all duration-200 ease-in-out cursor-pointer"
            onClick={() => {
              navigate(`/editor/${row.original.title}/${selectedVersion}`);
            }}
          >
            <Pen className="h-5 w-5" />
          </button>
        );
      },
    },
    {
      accessorKey: "delete",
      header: "Delete",
      cell: ({ row }) => {
        const title = row.original.title;
        return (
          <button
            className="inline-flex items-center justify-center p-2 rounded-full bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition-all duration-200 ease-in-out cursor-pointer"
            onClick={() => handleDeleteClick(title)}
          >
            <Trash2 className="h-5 w-5" />
          </button>
        );
      },
    },
  ];

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

  const handleDeleteClick = (title) => {
    setIsAlertOpen(true);
    setPostToDelete(title);
  };

  const handleDeletePost = () => {
    axios
      .post(
        `http://localhost:8080/delete`,
        { title: postToDelete },
        { withCredentials: true }
      )
      .then(() => {
        toast({
          variant: "default",
          title: "Post Deleted",
          description: `"${postToDelete}" has been permanently deleted.`,
          action: <Trash2 className="h-6 w-6" />,
          className:
            "bg-red-800 text-white font-['DM Sans'] border-none shadow-lg rounded-md",
          duration: 3000,
        });
        fetchData();
      })
      .catch((error) => {
        console.error("Delete error:", error);
        toast({
          variant: "destructive",
          title: "Deletion Failed",
          description: "There was an error deleting your post.",
          className:
            "bg-red-800 text-white font-['DM Sans'] border-none shadow-lg",
        });
      })
      .finally(() => {
        setIsAlertOpen(false);
      });
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
            title: <div className="flex items-center">File Uploaded</div>,
            description: `Your file, "${fileName}", has been uploaded successfully.`,
            variant: "success",
            action: <FaCheckCircle size={30} className="text-white" />,
            className:
              "bg-[#084464] text-white font-['DM Sans'] border-none shadow-lg w-auto backdrop-blur-md transition-all duration-300 ease-in-out",
            duration: 3000,
          });
        }, 500);
        fetchData();
      })
      .catch((error) => {
        console.error("File upload error:", error);
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          className:
            "bg-red-800 text-white font-['DM Sans'] border-none shadow-lg w-auto backdrop-blur-md transition-all duration-300 ease-in-out",
          description: "File upload failed. Please try again.",
        });
      })
      .finally(() => {
        handleRemoveFile();
      });
  };

  const filteredData = useMemo(() => {
    return data.filter((item) =>
      item.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const table = useReactTable({
    data: filteredData,
    columns: blogTablecols,
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
  }, [data, searchTerm]);

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

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mx-8 mt-10">
          <div className={`relative ${styles.card_transition}`}>
            <div className="absolute -top-5 left-6 z-10">
              <div className="w-16 h-16 bg-gradient-to-r from-[#005a7a] to-[#084464] rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                <Upload className="w-8 h-8 text-white" />
              </div>
            </div>
            <Card className="bg-white relative pt-10 h-[220px] rounded-xl shadow-md hover:shadow-xl transition-all duration-300 ease-out border border-gray-100 flex flex-col overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-50 opacity-50 rounded-bl-full"></div>
              <CardContent className="px-7 pb-7 flex flex-col justify-end h-full">
                <div>
                  <p className="text-gray-500 font-medium mb-2">
                    Upload a markdown file
                  </p>
                  <button
                    className="mt-3 bg-gradient-to-r from-[#005a7a] to-[#084464] text-white font-medium py-3.5 px-6 rounded-xl transition-all duration-300 w-full flex items-center justify-center gap-2 hover:shadow-md hover:translate-y-[-2px] active:translate-y-[0px]"
                    onClick={() => setIsOpen(true)}
                  >
                    <span className="flex items-center gap-2">
                      <FaUpload />
                      <span>Upload</span>
                    </span>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className={`relative ${styles.card_transition}`}>
            <div className="absolute -top-5 left-6 z-10">
              <div className="w-16 h-16 bg-gradient-to-r from-[#005a7a] to-[#084464] rounded-2xl flex items-center justify-center shadow-lg transform -rotate-2">
                <Pen className="w-8 h-8 text-white" />
              </div>
            </div>
            <Card className="bg-white relative pt-10 h-[220px] rounded-xl shadow-md hover:shadow-xl transition-all duration-300 ease-out border border-gray-100 flex flex-col overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-50 opacity-50 rounded-bl-full"></div>
              <CardContent className="px-7 pb-7 flex flex-col justify-end h-full">
                <div>
                  <p className="text-gray-500 font-medium mb-2">
                    Ready to start writing?
                  </p>
                  <button
                    className="mt-3 bg-gradient-to-r from-[#005a7a] to-[#084464] text-white font-medium py-3.5 px-6 rounded-xl transition-all duration-300 w-full flex items-center justify-center gap-2 hover:shadow-md hover:translate-y-[-2px] active:translate-y-[0px]"
                    onClick={() => navigate("/editor")}
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

          <div className={`relative ${styles.card_transition}`}>
            <div className="absolute -top-5 left-6 z-10">
              <div className="w-16 h-16 bg-gradient-to-r from-[#005a7a] to-[#084464] rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                <FaCss3 className="w-8 h-8 text-white" />
              </div>
            </div>
            <Card className="bg-white relative pt-10 h-[220px] rounded-xl shadow-md hover:shadow-xl transition-all duration-300 ease-out border border-gray-100 flex flex-col overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-50 opacity-50 rounded-bl-full"></div>
              <CardContent className="px-7 pb-7 flex flex-col justify-end h-full">
                <div>
                  <p className="text-gray-500 font-medium mb-2">
                    Upload custom CSS styling
                  </p>
                  <button
                    className="mt-3 bg-gradient-to-r from-[#005a7a] to-[#084464] text-white font-medium py-3.5 px-6 rounded-xl transition-all duration-300 w-full flex items-center justify-center gap-2 hover:shadow-md hover:translate-y-[-2px] active:translate-y-[0px]"
                    onClick
                  >
                    <span className="flex items-center gap-2">
                      <FaUpload />
                      <span>Upload</span>
                    </span>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Visit Blog Card */}
          <div className={`relative ${styles.card_transition}`}>
            <div className="absolute -top-5 left-6 z-10">
              <div className="w-16 h-16 bg-gradient-to-r from-[#005a7a] to-[#084464] rounded-2xl flex items-center justify-center shadow-lg transform rotate-1">
                <Notebook className="w-8 h-8 text-white" />
              </div>
            </div>
            <Card className="bg-white relative pt-10 h-[220px] rounded-xl shadow-md hover:shadow-xl transition-all duration-300 ease-out border border-gray-100 flex flex-col overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-50 opacity-50 rounded-bl-full"></div>
              <CardContent className="px-7 pb-7 flex flex-col justify-end h-full">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Your Blog
                </h3>
                <a
                  href={`/${user.name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 bg-gradient-to-r from-[#005a7a] to-[#084464] text-white font-medium py-3.5 px-6 rounded-xl transition-all duration-300 w-full flex items-center justify-center gap-2 hover:shadow-md hover:translate-y-[-2px] active:translate-y-[0px]"
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
          <div className="bg-white shadow-xl rounded-2xl p-6 mx-4 sm:mx-8 mt-12 h-auto w-auto overflow-hidden mb-12 hover:shadow-2xl transition-shadow duration-300 ease-in-out border border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h1 className="text-2xl font-bold text-[#003b5c] inline-flex items-center gap-2 whitespace-nowrap">
                <Notebook className="h-6 w-6" />
                My Blog Posts
                <span className="text-sm bg-[#003b5c] text-white px-3 py-1 rounded-full ml-1 font-medium">
                  {data.length}
                </span>
              </h1>

              <div className="relative w-full sm:w-auto">
                <Search className="h-4 w-4 absolute top-2.5 left-3 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search posts..."
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-[#003b5c] focus:border-transparent transition-all duration-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-6 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-gray-50 rounded-xl">
              <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gradient-to-r from-[#003b5c] to-[#0a5a7c]">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <th
                          key={header.id}
                          className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider"
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
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
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
                    </motion.tr>
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
            <div
              className="mb-6 bg-blue-50 p-8 rounded-2xl group transition-all duration-300 cursor-pointer w-full max-w-[250px] flex items-center justify-center"
              onClick={handleIconButtonClick}
            >
              <IconButton
                aria-label="upload"
                className="text-9xl text-[#084464] group-hover:text-[#005a7a] transition-colors duration-300 ease-in-out"
                disableRipple
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
              <div className="mt-2 text-base text-gray-700 font-medium bg-indigo-50 py-2 px-4 rounded-lg flex items-center gap-2 max-w-full overflow-hidden">
                <FaFile className="flex-shrink-0 text-[#084464]" />
                <span className="truncate">{fileName}</span>
              </div>
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

      <AlertDialog open={isalertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              post and all its versions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDeletePost()}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default BloggerHome;
