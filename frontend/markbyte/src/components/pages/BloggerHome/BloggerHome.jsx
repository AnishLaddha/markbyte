import styles from "./BloggerHome.module.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useRef, useEffect, useMemo } from "react";
import React from "react";
import { FaFileUpload, FaUpload } from "react-icons/fa";
import { FaRegPenToSquare } from "react-icons/fa6";
import { Card, CardContent } from "@/components/ui/card";
import {
  Home,
  Pen,
  Notebook,
  Trash2,
  Upload,
  FileArchive,
  X,
  File,
  ArrowUp,
  CheckCircle,
  ExternalLink,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import ConfirmDeleteDialog from "@/components/ui/confirmdelete";
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { motion } from "framer-motion";
import DashboardHeader from "@/components/ui/dashboardheader";
import BlogPostTable from "@/components/ui/blogposttable";
import { API_URL } from "@/config/api";

function BloggerHome() {
  const { data, fetchData } = useBlogData();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const [mdFileName, setMdFileName] = useState("");
  const [zipFileName, setZipFileName] = useState("");
  const mdFileInputRef = useRef(null);
  const zipFileInputRef = useRef(null);
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
      header: "Post Name",
    },
    {
      accessorKey: "date",
      header: "Date Published",
      cell: ({ getValue }) => {
        const date = new Date(getValue());
        if (isNaN(date.getTime())) return "N/A";
        
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
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
          className="flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          View Post <ExternalLink className="ml-1 h-4 w-4" />
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
                      `${API_URL}/publish`,
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
                          <CheckCircle size={30} className="text-white" />
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

  const handleIconButtonClick = (fileType) => {
    if (fileType === "md") {
      mdFileInputRef.current.click();
    } else if (fileType === "zip") {
      zipFileInputRef.current.click();
    }
  };

  const handleFileChange = (event, fileType) => {
    const file = event.target.files[0];
    if (fileType === "md") {
      setMdFileName(file ? file.name : "");
    } else if (fileType === "zip") {
      setZipFileName(file ? file.name : "");
    }
  };

  const handleRemoveFile = (fileType) => {
    if (fileType === "md") {
      setMdFileName("");
      if (mdFileInputRef.current) {
        mdFileInputRef.current.value = "";
      }
    } else {
      setZipFileName("");
      if (zipFileInputRef.current) {
        zipFileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteClick = (title) => {
    setIsAlertOpen(true);
    setPostToDelete(title);
  };

  const handleTabChange = (value) => {
    // Reset file input value when switching tabs
    if (value === "zip") {
      setMdFileName("");
      if (mdFileInputRef.current) {
        mdFileInputRef.current.value = "";
      }
    } else if (value === "markdown") {
      setZipFileName("");
      if (zipFileInputRef.current) {
        zipFileInputRef.current.value = "";
      }
    }
  };

  const createUploadToast = (fileType, fileName) => {
    return toast({
      title: <div className="flex items-center">File Uploaded</div>,
      description: `Your ${fileType} file, "${fileName}", has been uploaded successfully.`,
      variant: "success",
      action: <CheckCircle size={30} className="text-white" />,
      className:
        "bg-[#084464] text-white font-['DM Sans'] border-none shadow-lg w-auto backdrop-blur-md transition-all duration-300 ease-in-out",
      duration: 3000,
    });
  };

  const createFailureToast = (ttitle, tdescription) => {
    return toast({
      variant: "destructive",
      title: ttitle,
      description: tdescription,
      className: "bg-red-800 text-white font-['DM Sans'] border-none shadow-lg",
    });
  };

  const handleDeletePost = () => {
    axios
      .post(
        `${API_URL}/delete`,
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
        createFailureToast(
          "Deletion Failed",
          "There was an error deleting your post."
        );
      })
      .finally(() => {
        setIsAlertOpen(false);
      });
  };

  const handleUploadFile = (fileType) => {
    const fileInput = fileType === "md" ? mdFileInputRef : zipFileInputRef;
    const file = fileInput.current.files[0];
    const formData = new FormData();
    if (fileType == "md") {
      formData.append("file", file);
      axios
        .post(`${API_URL}/upload`, formData, {
          withCredentials: true,
        })
        .then(() => {
          setIsOpen(false);
          setTimeout(() => {
            createUploadToast(fileType, mdFileName);
          }, 500);
          fetchData();
        })
        .catch((error) => {
          console.error("File upload error:", error);
          createFailureToast(
            "Upload Failed",
            "There was an error uploading your file."
          );
        })
        .finally(() => {
          setMdFileName("");
          if (mdFileInputRef.current) {
            mdFileInputRef.current.value = "";
          }
        });
    } else {
      formData.append("zipfile", file);
      axios
        .post(`${API_URL}/zipupload`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        })
        .then(() => {
          setIsOpen(false);
          setTimeout(() => {
            createUploadToast(fileType, zipFileName);
          }, 500);
          fetchData();
        })
        .catch((error) => {
          console.error("File upload error:", error);
          createFailureToast(
            "Upload Failed",
            "There was an error uploading your file."
          );
        })
        .finally(() => {
          setZipFileName("");
          if (zipFileInputRef.current) {
            zipFileInputRef.current.value = "";
          }
        });
    }
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
      <DashboardHeader />

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mx-8 mt-10">
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
                    Upload your blog files
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

          {/* Visit Blog Card */}
          <div className={`relative ${styles.card_transition}`}>
            <div className="absolute -top-5 left-6 z-10">
              <div className="w-16 h-16 bg-gradient-to-r from-[#005a7a] to-[#084464] rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
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
        <BlogPostTable
          data={data}
          table={table}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
      </main>

      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) {
            setMdFileName("");
            setZipFileName("");
          }
        }}
      >
        <DialogContent className="sm:max-w-[450px] rounded-xl p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-[#003b5c] to-[#0a5a7c] p-6 text-white">
            <DialogHeader>
              <DialogTitle className="text-center text-3xl font-bold font-['DM Sans']">
                Upload Your File
              </DialogTitle>
            </DialogHeader>
          </div>
          <Tabs
            defaultValue="markdown"
            className="w-auto"
            onValueChange={handleTabChange}
          >
            <div className="flex justify-center px-8 pt-4 pb-2">
              <TabsList className="grid grid-cols-2 gap-1 w-full max-w-[320px]">
                <TabsTrigger
                  value="markdown"
                  className="data-[state=active]:bg-[#064c61] data-[state=active]:text-white transition-colors duration-200"
                >
                  Markdown
                </TabsTrigger>
                <TabsTrigger
                  value="zip"
                  className="data-[state=active]:bg-[#064c61] data-[state=active]:text-white transition-colors duration-200"
                >
                  ZIP
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent
              value="markdown"
              className="p-8 pt-0 flex flex-col items-center justify-center data-[state=inactive]:hidden"
            >
              <div
                className="w-full max-w-[320px] h-[180px] rounded-xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center gap-4 cursor-pointer"
                onClick={() => handleIconButtonClick("md")}
              >
                <IconButton
                  aria-label="upload markdown"
                  className="text-9xl text-[#084464] group-hover:text-[#005a7a] transition-colors duration-300 ease-in-out"
                  disableRipple
                >
                  <FaFileUpload size={80} />
                </IconButton>
                {!mdFileName && (
                  <p className="mt-1 text-base font-['DM Sans'] text-gray-500">
                    Select a Markdown file to upload
                  </p>
                )}
                {mdFileName && (
                  <p className="mt-1 text-base font-['DM Sans'] text-gray-500">
                    Change file
                  </p>
                )}
              </div>
              <input
                ref={mdFileInputRef}
                type="file"
                accept=".md"
                className="hidden"
                onChange={(e) => handleFileChange(e, "md")}
              />
              {mdFileName && (
                <div className="mt-6 w-full max-w-[320px]">
                  <div className="p-3 rounded-lg bg-primary/5 flex items-center gap-3 mb-4">
                    <div className="rounded-md bg-primary/10 p-2">
                      <File size={20} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {mdFileName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Markdown file
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleRemoveFile("md")}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                  <Button
                    className="w-full bg-gradient-to-r from-[#084464] to-[#0a5a7c] text-white"
                    onClick={() => handleUploadFile("md")}
                  >
                    <ArrowUp size={16} className="mr-2" />
                    Upload File
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent
              value="zip"
              className="p-8 pt-0 flex flex-col items-center justify-center data-[state=inactive]:hidden"
            >
              <div
                className="w-full max-w-[320px] h-[180px] rounded-xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center gap-4 cursor-pointer"
                onClick={() => handleIconButtonClick("zip")}
              >
                <IconButton
                  aria-label="upload zip"
                  className="text-9xl text-[#084464] group-hover:text-[#005a7a] transition-colors duration-300 ease-in-out"
                  disableRipple
                >
                  <FileArchive size={80} />
                </IconButton>
                {!zipFileName && (
                  <p className="mt-1 text-base font-['DM Sans'] text-gray-500">
                    Select a ZIP file to upload
                  </p>
                )}
                {zipFileName && (
                  <p className="mt-1 text-base font-['DM Sans'] text-gray-500">
                    Change file
                  </p>
                )}
              </div>
              <input
                ref={zipFileInputRef}
                type="file"
                accept=".zip"
                className="hidden"
                onChange={(e) => handleFileChange(e, "zip")}
              />
              {zipFileName && (
                <div className="mt-6 w-full max-w-[320px]">
                  <div className="p-3 rounded-lg bg-primary/5 flex items-center gap-3 mb-4">
                    <div className="rounded-md bg-primary/10 p-2">
                      <FileArchive size={20} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {zipFileName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ZIP Archive
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleRemoveFile("zip")}
                    >
                      <X size={16} />
                    </Button>
                  </div>
                  <Button
                    className="w-full bg-gradient-to-r from-[#084464] to-[#0a5a7c] text-white"
                    onClick={() => handleUploadFile("zip")}
                  >
                    <ArrowUp size={16} className="mr-2" />
                    Upload File
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        isOpen={isalertOpen}
        onOpenChange={setIsAlertOpen}
        onConfirm={handleDeletePost}
      />
    </div>
  );
}

export default BloggerHome;
