import React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import CodeMirror from "@uiw/react-codemirror";
import {
  markdown,
  markdownLanguage,
} from "@codemirror/lang-markdown";
import { html } from "@codemirror/lang-html";
import { languages } from "@codemirror/language-data";
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
  FileText,
  Home,
  CheckCircle,
  LayoutTemplate,
  Type,
  Box,
  Layers,
  Info,
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
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FaMarkdown } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { motion } from "framer-motion";
import mdtemplate from "@/constants/mdtemplate";
import { uploadMarkdownFile } from "@/services/blogService";

const EditorPreview = () => {
  const navigate = useNavigate();
  const [spin, setSpin] = useState(false);
  const [renderMarkdown, setRenderMarkdown] = useState(true);
  const [currMarkdownContent, setCurrMarkdownContent] = useState("");
  const [markdownContent, setMarkdownContent] = useState("");
  const [activeTab, setActiveTab] = useState("split");
  const [postTitle, setPostTitle] = useState("");
  const [showWarning, setShowWarning] = useState(false);
  const [warningmsg, setWarningMsg] = useState("");
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

  const handleRenderClick = useCallback(() => {
    setMarkdownContent(currMarkdownContent);
    setRenderMarkdown(true);
    setTimeout(() => setSpin(true), 0);
    setTimeout(() => setSpin(false), 500);
  }, [currMarkdownContent]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      const isR = e.key.toLowerCase() === "r";

      if (isCmdOrCtrl && isR) {
        e.preventDefault();
        handleRenderClick();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleRenderClick]);

  const handlePreviewUpload = () => {
    const blob = new Blob([currMarkdownContent], { type: "text/markdown" });
    uploadMarkdownFile(blob, postTitle)
      .then(() => {
        setTimeout(() => {
          toast({
            title: <div className="flex items-center">Post Uploaded</div>,
            description: `Your post, "${postTitle}", has been uploaded successfully.`,
            variant: "success",
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
        navigate("/"); // Redirect to the home page
      });
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
  };

  const loadTemplate = (name) => {
    if (name == "header") {
      setCurrMarkdownContent(currMarkdownContent + mdtemplate[0]);
      setMarkdownContent(markdownContent + mdtemplate[0]);
    } else if (name == "body") {
      setCurrMarkdownContent(currMarkdownContent + mdtemplate[1]);
      setMarkdownContent(markdownContent + mdtemplate[1]);
    } else if (name == "footer") {
      setCurrMarkdownContent(currMarkdownContent + mdtemplate[2]);
      setMarkdownContent(markdownContent + mdtemplate[2]);
    } else if (name == "full") {
      setCurrMarkdownContent(mdtemplate[3]);
      setMarkdownContent(mdtemplate[3]);
    }
    setRenderMarkdown(true);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    const match = value.match(/[\\/:*?"<>|_]/);

    if (match) {
      setShowWarning(true);
      setWarningMsg("Invalid character in title.");
      const index = match.index;
      const valueBeforeInvalidChar = value.slice(0, index);
      setPostTitle(valueBeforeInvalidChar);
    } else if (value.length > 100) {
      setShowWarning(true);
      setWarningMsg("Title exceeds 100 characters.");
      const trimmedValue = value.slice(0, 100);
      setPostTitle(trimmedValue);
    } else {
      setShowWarning(false);
      setWarningMsg("");
      setPostTitle(value);
    }
  };

  const { isAuthenticated, user, profilepicture, name, logout } = useAuth();
  const isSmallScreenupload = useMediaQuery("(max-width:580px)");
  const isSmallScreenlogo = useMediaQuery("(max-width:666px)");
  const isSmallScreen2 = useMediaQuery("(max-width:878px)");

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
            onValueChange={handleTabChange}
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
            {!isSmallScreenlogo && (
              <span className="text-xl font-semibold">arkByte</span>
            )}
          </div>
        </motion.div>

        {/* Right section with auth buttons */}
        <div className="flex items-center gap-5">
          {/* This button will load in a default template */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="bg-green-800 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 text-sm transition-all duration-300 shadow-lg shadow-blue-600/20 hover:shadow-blue-700/30 hover:bg-green-900">
                <FileText className="h-4 w-4" />
                {!isSmallScreen2 && (
                  <span className="font-bold">Templates</span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-34" align="end">
              <DropdownMenuItem
                onClick={() => loadTemplate("header")}
                className="flex items-center gap-3 py-2.5 px-3 cursor-pointer hover:bg-gray-50 rounded-sm transition-colors"
              >
                <Type className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Header</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => loadTemplate("body")}
                className="flex items-center gap-3 py-2.5 px-3 cursor-pointer hover:bg-gray-50 rounded-sm transition-colors"
              >
                <Box className="h-4 w-4 text-purple-600" />
                <span className="font-medium">Body</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => loadTemplate("footer")}
                className="flex items-center gap-3 py-2.5 px-3 cursor-pointer hover:bg-gray-50 rounded-sm transition-colors"
              >
                <LayoutTemplate className="h-4 w-4 text-amber-600" />
                <span className="font-medium">Footer</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1 h-px bg-gray-200" />

              <DropdownMenuItem
                onClick={() => loadTemplate("full")}
                className="flex items-center gap-3 py-2.5 px-3 cursor-pointer hover:bg-gray-50 rounded-sm transition-colors"
              >
                <Layers className="h-4 w-4 text-green-600" />
                <span className="font-medium">Full Template</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <button
            className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 text-sm transition-all duration-300 shadow-lg shadow-blue-600/20 hover:shadow-blue-700/30"
            onClick={() => setIsOpen(true)}
          >
            <Upload className="h-4 w-4" />
            {!isSmallScreenupload && <span className="font-bold">Publish</span>}
          </button>
          {isAuthenticated && (
            <UserDropdown
              userName={user.name}
              logout={logout}
              pfp={profilepicture}
              name={name}
            />
          )}
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
              extensions={[
                basicSetup,
                markdown({
                  base: markdownLanguage,
                  completeHTMLTags: true,
                  htmlTagLanguage: html(),
                  codeLanguages: languages,
                  addKeymap: true,
                }),
                EditorView.lineWrapping,
              ]}
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
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent className="bg-gradient-to-b from-slate-800 to-slate-900 border border-slate-700/50 text-white max-w-md rounded-xl shadow-xl">
          <AlertDialogHeader className="space-y-2">
            <AlertDialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
              <FileText className="h-5 w-5 text-blue-400" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300">
                Name Your Post
              </span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300 text-center text-sm">
              Give your markdown post a descriptive title that will engage your
              readers.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="my-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Enter post title..."
                className="w-full border border-slate-700 bg-slate-800/80 p-3 rounded-lg text-white placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 placeholder:text-sm"
                value={postTitle}
                onChange={handleInputChange}
              />
              <div className="absolute right-3 top-3 text-gray-500">
                {postTitle.length > 0 && (
                  <span className="text-xs">{postTitle.length}/100</span>
                )}
              </div>
            </div>

            {showWarning && (
              <div className="mt-2 text-red-400 text-sm flex items-center gap-1">
                <Info className="h-4 w-4" />
                {warningmsg}
              </div>
            )}
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
