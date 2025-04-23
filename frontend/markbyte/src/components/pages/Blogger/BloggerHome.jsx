import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useRef, useEffect, useMemo } from "react";
import React from "react";
import { FaFileUpload } from "react-icons/fa";
import { Card, CardContent } from "@/components/ui/card";
import {
  Pen,
  Notebook,
  Trash2,
  Upload,
  FileArchive,
  X,
  File,
  ArrowUp,
  CheckCircle,
  Info,
  ArrowRight,
  PenSquare,
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
import ConfirmDeleteDialog from "@/components/ui/confirmdelete";
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { motion, AnimatePresence } from "framer-motion";
import DashboardHeader from "@/components/ui/dashboardheader";
import BlogPostTable from "@/components/ui/bposttable";
import { blogTableStaticCols } from "@/constants/TableStaticcols";
import HomePageHeader from "@/components/ui/homepgintro";
import BloggerAnalytics from "@/components/pages/Blogger/BloggerAnalytics";
import {
  publishBlogVersion,
  deleteBlogPost,
  uploadMarkdownFile,
  uploadZipFile,
} from "@/services/blogService";
import { Input } from "@/components/ui/input";

function BloggerHome() {
  const { data, fetchData } = useBlogData();
  const navigate = useNavigate();
  const { user, name } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const [mdFileName, setMdFileName] = useState("");
  const [zipFileName, setZipFileName] = useState("");
  const [mdPostTitle, setMdPostTitle] = useState("");
  const [zipPostTitle, setZipPostTitle] = useState("");
  const mdFileInputRef = useRef(null);
  const zipFileInputRef = useRef(null);
  const [selectedVersions, setSelectedVersions] = useState({});
  const [isalertOpen, setIsAlertOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState("");
  const [pgVal, setpgVal] = useState("home");
  const [showmdWarning, setShowmdWarning] = useState(false);
  const [mdwarningMsg, setmdWarningMsg] = useState("");
  const [showzipWarning, setShowzipWarning] = useState(false);
  const [zipwarningMsg, setzipWarningMsg] = useState("");

  useEffect(() => {
    setSelectedVersions(
      data.reduce((acc, row) => {
        acc[row.title] = row.latestVersion;
        return acc;
      }, {})
    );
  }, [data]);

  const blogTableDynamiccols = [
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
                  publishBlogVersion(
                    user.name,
                    row.original.title,
                    selectedVersion
                  ).then(() => {
                    fetchData();
                    toast({
                      variant: "default",
                      title: "Version Published Successfully",
                      description: `Version ${selectedVersion} of "${row.original.title}" has been published.`,
                      action: <CheckCircle size={30} className="text-white" />,
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

  const blogTablecols = [...blogTableStaticCols, ...blogTableDynamiccols];

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
      setMdPostTitle("");
      if (mdFileInputRef.current) {
        mdFileInputRef.current.value = "";
      }
    } else {
      setZipFileName("");
      setZipPostTitle("");
      if (zipFileInputRef.current) {
        zipFileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteClick = (title) => {
    setIsAlertOpen(true);
    setPostToDelete(title);
  };

  const handlePageTabChange = (newTab) => {
    setpgVal(newTab);
  };

  const handleTabChange = (value) => {
    // Reset file input value when switching tabs
    if (value === "zip") {
      setMdFileName("");
      setMdPostTitle("");
      if (mdFileInputRef.current) {
        mdFileInputRef.current.value = "";
      }
    } else if (value === "markdown") {
      setZipFileName("");
      setZipPostTitle("");
      if (zipFileInputRef.current) {
        zipFileInputRef.current.value = "";
      }
    }
  };

  const createUploadToast = (posttitle) => {
    return toast({
      title: <div className="flex items-center">File Uploaded</div>,
      description: `Your post, "${posttitle}", has been uploaded successfully.`,
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
    // refactor with service
    deleteBlogPost(postToDelete)
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
    if (fileType == "md") {
      // refactor with service
      uploadMarkdownFile(file, mdPostTitle)
        .then(() => {
          setIsOpen(false);
          setTimeout(() => {
            createUploadToast(mdPostTitle);
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
          setMdPostTitle("");
          if (mdFileInputRef.current) {
            mdFileInputRef.current.value = "";
          }
        });
    } else {
      uploadZipFile(file, zipPostTitle)
        .then(() => {
          setIsOpen(false);
          setTimeout(() => {
            createUploadToast(zipPostTitle);
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
          setZipPostTitle("");
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

  const handleInputChange = (e, type) => {
    const value = e.target.value;
    const match = value.match(/[\\/:*?"<>|_]/);

    let setTitle, setShowWarning, setWarningMsg;

    if (type === "md") {
      setTitle = setMdPostTitle;
      setShowWarning = setShowmdWarning;
      setWarningMsg = setmdWarningMsg;
    } else if (type === "zip") {
      setTitle = setZipPostTitle;
      setShowWarning = setShowzipWarning;
      setWarningMsg = setzipWarningMsg;
    }

    if (match) {
      setShowWarning(true);
      setWarningMsg("Invalid character in title.");
      const index = match.index;
      const valueBeforeInvalidChar = value.slice(0, index);
      setTitle(valueBeforeInvalidChar);
    } else if (value.length > 100) {
      setShowWarning(true);
      setWarningMsg("Title exceeds 100 characters.");
      const trimmedValue = value.slice(0, 100);
      setTitle(trimmedValue);
    } else {
      setShowWarning(false);
      setWarningMsg("");
      setTitle(value);
    }
  };

  const handleMdInputChange = (e) => handleInputChange(e, "md");
  const handleZipInputChange = (e) => handleInputChange(e, "zip");

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      <DashboardHeader />

      <main className="container mx-auto px-4 sm:px-4 py-8">
        <HomePageHeader
          pgVal={pgVal}
          name={name}
          handlePageTabChange={handlePageTabChange}
        />

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pgVal}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {pgVal == "home" && (
              <div className="home-content">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mx-8 mt-10">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
                    className="relative"
                  >
                    <div className="absolute -top-6 left-8 z-10">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#005a7a] to-[#084464] rounded-xl flex items-center justify-center shadow-lg transform rotate-2 hover:rotate-0 transition-all duration-300">
                        <Upload className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <Card className="bg-white/80 backdrop-blur-sm relative pt-12 h-[240px] rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ease-out border border-gray-100/60 flex flex-col overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-100/30 rounded-bl-full pointer-events-none"></div>
                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#005a7a]/5 rounded-tr-full pointer-events-none"></div>
                      <CardContent className="px-8 pb-8 flex flex-col justify-between h-full">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800 mb-2">
                            Import Content
                          </h3>
                          <p className="text-gray-600 text-sm">
                            Upload your blog files
                          </p>
                        </div>

                        <button
                          onClick={() => setIsOpen(true)}
                          className="mt-4 bg-[#084464] hover:bg-[#0a5178] text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 ease-in-out w-full flex items-center justify-center whitespace-nowrap"
                        >
                          <span className="mr-2">Upload Files</span>
                          <Upload className="h-5 w-5" />
                        </button>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
                    className="relative"
                  >
                    <div className="absolute -top-6 left-8 z-10">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#005a7a] to-[#084464] rounded-xl flex items-center justify-center shadow-lg transform rotate-2 hover:rotate-0 transition-all duration-300">
                        <Pen className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <Card className="bg-white/80 backdrop-blur-sm relative pt-12 h-[240px] rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ease-out border border-gray-100/60 flex flex-col overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-100/30 rounded-bl-full pointer-events-none"></div>
                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#005a7a]/5 rounded-tr-full pointer-events-none"></div>

                      <CardContent className="px-8 pb-8 flex flex-col justify-between h-full">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800 mb-2">
                            Ready to Create
                          </h3>
                          <p className="text-gray-600 text-sm">
                            Start writing your next great story
                          </p>
                        </div>

                        <button
                          onClick={() => navigate("/editor")}
                          className="mt-4 bg-[#084464] hover:bg-[#0a5178] text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 ease-in-out w-full flex items-center justify-center whitespace-nowrap "
                        >
                          <span className="mr-2">Start Writing</span>
                          <PenSquare className="h-5 w-5" />
                        </button>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
                    className="relative"
                  >
                    <div className="absolute -top-6 left-8 z-10">
                      <div className="w-16 h-16 bg-gradient-to-br from-[#005a7a] to-[#084464] rounded-xl flex items-center justify-center shadow-lg transform rotate-2 hover:rotate-0 transition-all duration-300">
                        <Notebook className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <Card className="bg-white/80 backdrop-blur-sm relative pt-12 h-[240px] rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 ease-out border border-gray-100/60 flex flex-col overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-100/30 rounded-bl-full pointer-events-none"></div>
                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#005a7a]/5 rounded-tr-full pointer-events-none"></div>
                      <CardContent className="px-8 pb-8 flex flex-col justify-between h-full">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-800 mb-2">
                            Your Blog
                          </h3>
                          <p className="text-gray-600 text-sm">
                            Share your thoughts with the world
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            window.open(
                              `/${user.name}`,
                              "_blank",
                              "noopener,noreferrer"
                            )
                          }
                          className="mt-4 bg-[#084464] hover:bg-[#0a5178] text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 ease-in-out w-full flex items-center justify-center whitespace-nowrap"
                        >
                          <span className="mr-2">Visit Blog</span>
                          <ArrowRight className="h-5 w-5" />
                        </button>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
                <BlogPostTable
                  data={data}
                  table={table}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                />
              </div>
            )}
            {pgVal == "analytics" && <BloggerAnalytics />}
          </motion.div>
        </AnimatePresence>
      </main>

      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) {
            setMdFileName("");
            setZipFileName("");
            setMdPostTitle("");
            setZipPostTitle("");
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
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Enter blog title"
                      className="w-full max-w-[320px] mb-2"
                      onChange={handleMdInputChange}
                      value={mdPostTitle}
                    />
                    <div className="absolute right-3 top-3 text-gray-500">
                      {mdPostTitle.length > 0 && (
                        <span className="text-xs">
                          {mdPostTitle.length}/100
                        </span>
                      )}
                    </div>
                  </div>
                  {showmdWarning && (
                    <div className="text-red-400 text-sm flex items-center gap-1 mb-2 mt-2">
                      <Info className="h-4 w-4" />
                      {mdwarningMsg}
                    </div>
                  )}
                  <Button
                    className={`w-full text-white ${
                      mdPostTitle.length < 1
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-[#084464] to-[#0a5a7c]"
                    }`}
                    onClick={() => handleUploadFile("md")}
                    disabled={mdPostTitle.length < 1}
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
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Enter blog title"
                      className="mb-2 w-full max-w-[320px]"
                      onChange={handleZipInputChange}
                      value={zipPostTitle}
                    />
                    <div className="absolute right-3 top-3 text-gray-500">
                      {zipPostTitle.length > 0 && (
                        <span className="text-xs">
                          {zipPostTitle.length}/100
                        </span>
                      )}
                    </div>
                  </div>
                  {showzipWarning && (
                    <div className="text-red-400 text-sm flex items-center gap-1 mb-2 mt-2">
                      <Info className="h-4 w-4" />
                      {zipwarningMsg}
                    </div>
                  )}
                  <Button
                    className={`w-full text-white ${
                      zipPostTitle.length < 1
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-[#084464] to-[#0a5a7c]"
                    }`}
                    onClick={() => handleUploadFile("zip")}
                    disabled={zipPostTitle.length < 1}
                  >
                    <ArrowUp size={16} className="mr-2" />
                    Upload Zip
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
