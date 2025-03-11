import React from "react";
import { useState, useEffect, useRef } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { marked } from "marked";
import { basicSetup } from "codemirror";
import {
  abcdef,
  andromeda,
  material,
  tokyoNight,
  vscodeDark,
} from "@uiw/codemirror-themes-all";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import UserDropdown from "@/components/ui/profiledropdown";
import { useMediaQuery } from "@mui/material";
import { EditorView } from "@codemirror/view";
import Preview from "@/components/pages/Preview/Preview";
import {
  FileEdit,
  RefreshCw,
  SquareSplitHorizontal,
  Eye,
  Trash2,
  ClipboardPaste,
  Upload,
  FileText,
  Home,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FaMarkdown } from "react-icons/fa";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { FaCheckCircle } from "react-icons/fa";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

const EditorPreview = () => {
  // Set the initial content

  const navigate = useNavigate();
  const [spin, setSpin] = useState(false);
  const [renderMarkdown, setRenderMarkdown] = useState(true);
  const [currMarkdownContent, setCurrMarkdownContent] = useState("");
  const [markdownContent, setMarkdownContent] = useState("");
  const [activeTab, setActiveTab] = useState("split");
  const [postTitle, setpostTitle] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const editorPanelRef = useRef(null);
  const previewPanelRef = useRef(null);
  const { toast } = useToast();

  const handleMarkdownChange = (value) => {
    console.log(value);
    console.log(marked.parse(value));
    if (value === "") {
      setCurrMarkdownContent(" ");
      setTimeout(() => {
        setCurrMarkdownContent("");
      }, 0);
    } else {
      setCurrMarkdownContent(value);
    }
  };

  useEffect(() => {
    if (editorPanelRef.current && previewPanelRef.current) {
      if (activeTab === "editor") {
        editorPanelRef.current.resize(100);
        previewPanelRef.current.resize(0);
      } else if (activeTab === "preview") {
        editorPanelRef.current.resize(0);
        previewPanelRef.current.resize(100);
      } else if (activeTab === "split") {
        editorPanelRef.current.resize(50);
        previewPanelRef.current.resize(50);
      }
    }
  }, [activeTab]);

  useEffect(() => {
    if (renderMarkdown) {
      setMarkdownContent(currMarkdownContent);
      setRenderMarkdown(false); // Reset renderMarkdown to false after initial render
    }
  }, [renderMarkdown]);

  const handleRenderClick = () => {
    setMarkdownContent(currMarkdownContent);
    setRenderMarkdown(true);
    setTimeout(() => {
      setSpin(true);
    }, 0);
    setTimeout(() => {
      setSpin(false);
    }, 500);
  };

  const handlePreviewClick = () => {
    setIsOpen(true);
  };

  const handlePreviewUpload = () => {
    const blob = new Blob([currMarkdownContent], { type: "text/markdown" });
    const formData = new FormData();
    formData.append("file", blob, postTitle + ".md");
    axios
      .post("http://localhost:8080/upload", formData, { withCredentials: true })
      .then(() => {
        setTimeout(() => {
          toast({
            title: <div className="flex items-center">File Uploaded</div>,
            description: `Your post, "${postTitle}", has been uploaded successfully.`,
            variant: "success",
            action: <FaCheckCircle size={30} className="text-white" />,
            className:
              "bg-[#084464] text-white font-['DM Sans'] border-none shadow-lg w-auto backdrop-blur-md transition-all duration-300 ease-in-out",
            duration: 3000,
          });
        }, 3000);
      })
      .catch((error) => {
        console.error("File upload error:", error);
      })
      .finally(() => {
        navigate("/"); // Redirect to the home page
      });
  };

  const { isAuthenticated, user, logout } = useAuth();
  const isSmallScreen = useMediaQuery("(max-width:470px)");

  return (
    <div className="Preview min-h-screen flex flex-col bg-[#0d1117] text-gray-200 overflow-hidden transition-colors duration-300">
      <header
        className="sticky top-0 left-0 w-full h-16 flex justify-between items-center px-4 md:px-6 bg-opacity-80 backdrop-blur-md shadow-md z-10 transition-all duration-300 ease-in-out"
        style={{
          background:
            "linear-gradient(to right, rgba(9, 25, 43, 0.95), rgba(9, 30, 54, 0.95), rgba(9, 25, 43, 0.95))",
        }}
      >
        {/* Left section with logo */}
        <div className="flex items-center cursor-pointer">
          <button
            className="p-2 rounded-full hover:bg-slate-700/50 transition-colors"
            onClick={() => navigate("/")}
          >
            <Home className="h-5 w-5 text-blue-400" />
          </button>
          <Tabs
            className="w-auto rounded-md ml-2"
            defaultValue="split"
            onValueChange={(value) => setActiveTab(value)}
          >
            <TabsList className="grid w-full grid-cols-3 gap-1 bg-slate-800/60 p-1 rounded-xl">
              <TabsTrigger
                value="editor"
                className="flex items-center justify-center transition-all duration-200 focus:ring-2 focus:ring-blue-500 data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white rounded-lg transform hover:scale-105"
              >
                <FaMarkdown className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger
                value="split"
                className="flex items-center justify-center transition-all duration-200 focus:ring-2 focus:ring-blue-500 data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white rounded-lg transform hover:scale-105"
              >
                <SquareSplitHorizontal className="h-5 w-5" />
              </TabsTrigger>
              <TabsTrigger
                value="preview"
                className="flex items-center justify-center transition-all duration-200 focus:ring-2 focus:ring-blue-500 data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white rounded-lg transform hover:scale-105"
              >
                <Eye className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Center section with title */}
        <div
          className="absolute left-1/2 transform -translate-x-1/2 flex items-center cursor-pointer"
          onClick={() => navigate("/")}
        >
          <img
            src="/assets/markbytealt.png"
            alt="MarkByte Logo"
            className="h-10 w-auto"
          />
          {!isSmallScreen && (
            <span className="text-xl font-semibold">arkByte</span>
          )}
        </div>

        {/* Right section with auth buttons */}
        <div className="flex items-center gap-5">
          <button
            className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 text-sm transition-all duration-300 shadow-lg shadow-blue-600/20 hover:shadow-blue-700/30"
            onClick={() => handlePreviewClick()}
          >
            <Upload className="h-4 w-4" />
            <span className="font-bold">{isSmallScreen ? "" : "Publish"}</span>
          </button>

          {isAuthenticated && (
            <UserDropdown userName={user.name} logout={logout} />
          )}
        </div>
      </header>
      <PanelGroup direction="horizontal">
        <Panel
          className="flex flex-col h-full"
          ref={editorPanelRef}
          defaultSize={50}
        >
          <div className="w-full h-[50px] bg-gray-700 text-white flex items-center justify-between px-4 border-b border-slate-700/50">
            <div className="flex items-center gap-2 font-medium">
              <FileEdit size={16} className="text-blue-300" />
              <span className="tracking-wide font-semibold text-md">
                Editor
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-3 bg-gray-800 text-gray-300 px-2 py-1.5 rounded-lg">
                <button
                  className="text-red-400 hover:text-red-300 transition-colors"
                  onClick={() => setCurrMarkdownContent("")}
                  title="Clear content"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  className="text-gray-300 hover:text-white transition-colors"
                  onClick={() => {
                    navigator.clipboard
                      .readText()
                      .then((text) => setCurrMarkdownContent(text));
                  }}
                  title="Paste from clipboard"
                >
                  <ClipboardPaste className="w-4 h-4" />
                </button>
              </div>
              <div className="bg-gray-800 text-gray-300 px-3 py-1.5 rounded-lg flex items-center gap-1">
                <span className="text-blue-400 font-medium">
                  {currMarkdownContent.split(/\s+/).filter(Boolean).length}
                </span>
                <span>words</span>
              </div>
              <div className="bg-gray-800 text-gray-300 px-3 py-1.5 rounded-lg flex items-center gap-1">
                <span className="text-green-400 font-medium">
                  {currMarkdownContent.length}
                </span>
                <span>chars</span>
              </div>
            </div>
          </div>
          <div className="w-full h-[calc(100vh-64px-50px)]">
            <CodeMirror
              value={currMarkdownContent}
              height="100%"
              width="100%"
              extensions={[basicSetup, markdown(), EditorView.lineWrapping]}
              theme={tokyoNight}
              onChange={(value) => handleMarkdownChange(value)}
              className="h-full text-lg font-['JetBrains Mono',monospace]"
            />
          </div>
        </Panel>

        <PanelResizeHandle
          className="w-2 bg-gradient-to-b from-slate-600 to-slate-800 cursor-ew-resize rounded-full mx-0.5 transition-all duration-200 ease-in-out shadow-md flex items-center justify-center"
          style={{
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div className="flex flex-col items-center justify-center space-y-1">
            <div className="w-1 h-1 bg-white rounded-full opacity-70"></div>
            <div className="w-1 h-1 bg-white rounded-full opacity-70"></div>
            <div className="w-1 h-1 bg-white rounded-full opacity-70"></div>
          </div>
        </PanelResizeHandle>

        {/* Preview Panel */}
        <Panel
          className="flex flex-col h-full"
          ref={previewPanelRef}
          defaultSize={50}
        >
          <div className="w-full h-[50px] bg-gray-700 text-white flex items-center justify-between px-4 shadow-sm border-b border-slate-700/50">
            <div className="flex items-center gap-2 font-medium">
              <Eye size={16} className="text-green-300" />
              <span className="tracking-wide">Preview</span>
            </div>
            {activeTab === "split" && (
              <button
                onClick={handleRenderClick}
                className="flex items-center gap-1 bg-gradient-to-r from-emerald-600/40 to-green-600/40 hover:from-emerald-600/60 hover:to-green-600/60 text-green-200 px-3 py-1.5 rounded-lg font-medium transition-all duration-300 text-sm shadow-md shadow-green-900/30"
              >
                <RefreshCw
                  size={14}
                  className={`mr-1 ${spin ? "animate-spin" : ""}`}
                />
                Render
              </button>
            )}
          </div>
          <Preview
            markdownContent={markdownContent}
            renderMarkdown={renderMarkdown}
            setRenderMarkdown={setRenderMarkdown}
          />
        </Panel>
      </PanelGroup>
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent className="bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/50 text-white max-w-md rounded-xl shadow-xl">
          <AlertDialogHeader className="space-y-3">
            <AlertDialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
              <FileText className="h-6 w-6 text-blue-400" />
              <span>Name Your Post</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300 text-center">
              Give your markdown post a descriptive title. This will be
              displayed to readers.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="my-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Enter post title..."
                className="w-full border border-slate-700 bg-slate-800/80 p-3 rounded-lg text-white placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                value={postTitle}
                onChange={(e) => setpostTitle(e.target.value)}
              />
              <div className="absolute right-3 top-3 text-gray-500">
                {postTitle.length > 0 && (
                  <span className="text-xs">{postTitle.length}/100</span>
                )}
              </div>
            </div>
          </div>

          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
            <AlertDialogCancel
              onClick={() => setIsOpen(false)}
              className="bg-transparent border border-slate-600 hover:bg-slate-700 text-gray-300 hover:text-white transition-all duration-300 rounded-lg"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePreviewUpload}
              className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white border-none transition-all duration-300 rounded-lg shadow-lg shadow-blue-600/20 hover:shadow-blue-700/30 flex items-center justify-center gap-2"
              disabled={!postTitle.trim()}
            >
              <Upload className="h-4 w-4" />
              Publish Post
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EditorPreview;
