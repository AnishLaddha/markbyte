import React from "react";
import { useState, useEffect, useRef } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { basicSetup } from "codemirror";
import {
  aura,
  andromeda,
  material,
  tokyoNight,
  vscodeDark,
  okaidia,
  bbedit,
} from "@uiw/codemirror-themes-all";
import { oneDark } from "@codemirror/theme-one-dark";
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
  Home,
  Undo2,
  CheckCircle,
} from "lucide-react";
import { useParams } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FaMarkdown } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { motion } from "framer-motion";
import {
  uploadMarkdownFile,
  getMarkdownVersion,
} from "@/services/blogService";

const PublishEditorPreview = () => {
  // Set the initial content
  const navigate = useNavigate();
  const { title, version } = useParams();
  const [currMarkdownContent, setCurrMarkdownContent] = useState("");
  const [markdownContent, setMarkdownContent] = useState("");

  const revert = () => {
    getMarkdownVersion(title, version)
      .then((response) => {
        setCurrMarkdownContent(response.data);
        setMarkdownContent(response.data);
        setRenderMarkdown(true);
      })
      .catch((error) => {
        console.error("Markdown fetch error:", error);
      });
  };

  // fetch the markdown content from the backend on page load
  useEffect(() => {
    revert();
  }, []);

  const [spin, setSpin] = useState(false);
  const [renderMarkdown, setRenderMarkdown] = useState(true);
  const [activeTab, setActiveTab] = useState("split");
  const [isOpen, setIsOpen] = useState(false);
  const editorPanelRef = useRef(null);
  const previewPanelRef = useRef(null);
  const [currTheme, setCurrTheme] = useState("vscodeDark");
  const themeOptions = {
    aura,
    andromeda,
    material,
    tokyoNight,
    vscodeDark,
    okaidia,
    oneDark,
    bbedit,
  };
  const { toast } = useToast();

  const handleMarkdownChange = (value) => {
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
      setRenderMarkdown(false);
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

  const handlePreviewUpload = () => {
    const blob = new Blob([currMarkdownContent], { type: "text/markdown" });
    uploadMarkdownFile(blob, title + ".md")
      .then(() => {
        setTimeout(() => {
          toast({
            variant: "default",
            title: "Version Published Successfully",
            description: `Version ${String(
              Number(version) + 1
            )} of "${title}" has been published.`,
            action: <CheckCircle size={30} className="text-white" />,
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
        navigate("/");
      });
  };

  const { isAuthenticated, user, profilepicture, name, logout } = useAuth();
  const isSmallScreen = useMediaQuery("(max-width:470px)");

  return (
    <div className="Preview min-h-screen flex flex-col bg-[#0d1117] text-gray-200 overflow-hidden transition-colors duration-300">
      <header
        className="sticky top-0 left-0 w-full h-16 flex justify-between items-center px-4 md:px-6 shadow-lg z-10 transition-all duration-300 ease-in-out"
        style={{
          background:
            "linear-gradient(to right, rgba(9, 25, 43, 0.95), rgba(9, 30, 54, 0.95), rgba(9, 25, 43, 0.95))",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* Left section with logo */}
        <div className="flex items-center space-x-3">
          <button
            className="p-2 rounded-full bg-slate-800/50 hover:bg-slate-700/70 transition-all duration-200 transform hover:scale-105 hover:shadow-md hover:shadow-blue-900/20"
            onClick={() => navigate("/")}
          >
            <Home className="h-5 w-5 text-blue-400" />
          </button>
          <Tabs
            className="w-auto rounded-md"
            defaultValue="split"
            onValueChange={(value) => setActiveTab(value)}
          >
            <TabsList className="grid w-full grid-cols-3 gap-1 bg-slate-800/60 p-1 rounded-xl">
              <TabsTrigger
                value="editor"
                className="flex items-center justify-center transition-all duration-200 focus:ring-2 focus:ring-blue-500 data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white rounded-lg transform hover:scale-105"
                onClick={() => {
                  if (
                    activeTab === "editor" &&
                    editorPanelRef.current &&
                    previewPanelRef.current
                  ) {
                    editorPanelRef.current.resize(100);
                    previewPanelRef.current.resize(0);
                  }
                }}
              >
                <FaMarkdown className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger
                value="split"
                className="flex items-center justify-center transition-all duration-200 focus:ring-2 focus:ring-blue-500 data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white rounded-lg transform hover:scale-105"
                onClick={() => {
                  if (
                    activeTab === "split" &&
                    editorPanelRef.current &&
                    previewPanelRef.current
                  ) {
                    editorPanelRef.current.resize(50);
                    previewPanelRef.current.resize(50);
                  }
                }}
              >
                <SquareSplitHorizontal className="h-5 w-5" />
              </TabsTrigger>
              <TabsTrigger
                value="preview"
                className="flex items-center justify-center transition-all duration-200 focus:ring-2 focus:ring-blue-500 data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white rounded-lg transform hover:scale-105"
                onClick={() => {
                  if (
                    activeTab === "preview" &&
                    editorPanelRef.current &&
                    previewPanelRef.current
                  ) {
                    editorPanelRef.current.resize(0);
                    previewPanelRef.current.resize(100);
                  }
                }}
              >
                <Eye className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Center section with title */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="absolute inset-x-0 flex justify-center items-center pointer-events-none cursor-pointer"
        >
          <div
            onClick={() => navigate("/")}
            className="flex items-center pointer-events-auto hover:opacity-90 transition-opacity"
          >
            <img
              src="/assets/markbytealt.png"
              alt="MarkByte Logo"
              className="h-12 w-auto"
            />
            {!isSmallScreen && (
              <span className="text-xl font-semibold">arkByte</span>
            )}
          </div>
        </motion.div>

        {/* Right section with auth buttons */}
        <div className="flex items-center gap-5">
          <button
            className="bg-gradient-to-r from-green-800 to-green-600 hover:from-green-900 hover:to-green-700 
             text-white font-semibold p-2 rounded-full flex items-center justify-center 
             transition-all duration-300 shadow-lg shadow-green-800/20 hover:shadow-green-900/30"
            onClick={() => revert()}
            title="Revert to original"
          >
            <Undo2 className="h-4 w-4" />
          </button>

          <button
            className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 text-sm transition-all duration-300 shadow-lg shadow-blue-600/20 hover:shadow-blue-700/30"
            onClick={() => handlePreviewUpload()}
          >
            <Upload className="h-4 w-4" />
            <span className="font-bold">{isSmallScreen ? "" : "Publish"}</span>
          </button>
          {isAuthenticated && <UserDropdown />}
        </div>
      </header>

      <PanelGroup direction="horizontal">
        <Panel
          className="flex flex-col h-full"
          ref={editorPanelRef}
          defaultSize={50}
        >
          <div className="w-full h-12 bg-gradient-to-r from-slate-800 to-slate-900 text-white flex items-center justify-between px-4 border-b border-slate-700/50 shadow-md">
            <div className="flex items-center gap-2 font-medium">
              <FileEdit size={17} className="text-blue-300" />
              <span className="font-semibold text-blue-100 font-medium">
                Markdown Editor
              </span>
              <Select
                defaultValue="vscodeDark"
                value={currTheme}
                onValueChange={(value) => setCurrTheme(value)}
              >
                <SelectTrigger className="w-auto h-8 bg-slate-800 border border-slate-700/50 text-blue-300 rounded-lg shadow-sm hover:shadow-md ml-2 text-xs">
                  <SelectValue placeholder="Theme" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-gray-200 shadow-xl">
                  <SelectGroup>
                    <SelectLabel className="text-gray-400 text-xs">
                      Themes
                    </SelectLabel>
                    {Object.keys(themeOptions).map((themeName) => (
                      <SelectItem
                        key={themeName}
                        value={themeName}
                        className="hover:bg-slate-700 focus:bg-gray-700 cursor-pointer text-sm"
                      >
                        <span className="mr-2">
                          {themeName.charAt(0).toUpperCase() +
                            themeName.slice(1)}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1 bg-gray-800/80 text-gray-300 px-2 py-1 rounded-lg shadow-inner">
                <button
                  className="text-red-400 hover:text-red-300 p-1 rounded-md hover:bg-slate-700/50 transition-colors"
                  onClick={() => setCurrMarkdownContent("")}
                  title="Clear content"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  className="text-gray-300 hover:text-white transition-colors p-1 rounded-md hover:bg-slate-700/50"
                  onClick={() => {
                    navigator.clipboard
                      .readText()
                      .then((text) => setCurrMarkdownContent(text));
                  }}
                  title="Paste from clipboard"
                >
                  <ClipboardPaste className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex gap-1">
                <div className="bg-slate-800/80 text-gray-300 px-2.5 py-1 rounded-lg shadow-inner flex items-center gap-1">
                  <span className="text-blue-400 font-medium">
                    {currMarkdownContent.split(/\s+/).filter(Boolean).length}
                  </span>
                  <span>words</span>
                </div>
                <div className="bg-slate-800/80 text-gray-300 px-2.5 py-1 rounded-lg shadow-inner flex items-center gap-1">
                  <span className="text-green-400 font-medium">
                    {currMarkdownContent.length}
                  </span>
                  <span>chars</span>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full h-[calc(100vh-64px-48px)] bg-[#0d1117]">
            <CodeMirror
              value={currMarkdownContent}
              height="100%"
              width="100%"
              extensions={[basicSetup, markdown(), EditorView.lineWrapping]}
              theme={themeOptions[currTheme] || tokyoNight}
              onChange={(value) => handleMarkdownChange(value)}
              className="h-full text-lg font-['JetBrains Mono',monospace]"
            />
          </div>
        </Panel>

        <PanelResizeHandle className="w-1.5 bg-gradient-to-b from-blue-900/20 to-slate-900/20 cursor-ew-resize transition-all duration-200 ease-in-out flex items-center justify-center hover:w-2">
          <div className="h-16 flex flex-col items-center justify-center space-y-1.5">
            <div className="w-1 h-1 bg-blue-400 rounded-full opacity-70"></div>
            <div className="w-1 h-1 bg-blue-400 rounded-full opacity-70"></div>
            <div className="w-1 h-1 bg-blue-400 rounded-full opacity-70"></div>
          </div>
        </PanelResizeHandle>

        {/* Preview Panel */}
        <Panel
          className="flex flex-col h-full"
          ref={previewPanelRef}
          defaultSize={50}
        >
          <div className="w-full h-12 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between px-4 shadow-md border-b border-slate-700/50">
            <div className="flex items-center gap-2 font-medium">
              <Eye size={17} className="text-green-300" />
              <span className="font-medium text-green-100">Preview</span>
            </div>
            {activeTab === "split" && (
              <button
                onClick={handleRenderClick}
                className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-800/40 to-emerald-700/40 hover:from-emerald-700/60 hover:to-emerald-600/60 text-green-200 px-3 py-1.5 rounded-lg font-medium transition-all duration-300 text-xs shadow-md shadow-green-900/30"
              >
                <RefreshCw
                  size={12}
                  className={`${spin ? "animate-spin" : ""}`}
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
    </div>
  );
};

export default PublishEditorPreview;
