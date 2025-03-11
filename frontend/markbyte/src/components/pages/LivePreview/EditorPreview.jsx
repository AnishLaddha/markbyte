import React from "react";
import { useState, useEffect } from "react";
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
import { CiLogin } from "react-icons/ci";
import { EditorView } from "@codemirror/view";
import Preview from "@/components/pages/Preview/Preview";
import {
  FileEdit,
  Pencil,
  RefreshCw,
  Code,
  SquareSplitHorizontal,
  Eye,
  Trash2,
  ClipboardPaste,
  Upload,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FaMarkdown } from "react-icons/fa";

const EditorPreview = () => {
  // Set the initial content

  const navigate = useNavigate();
  const [spin, setSpin] = useState(false);
  const [renderMarkdown, setRenderMarkdown] = useState(true);
  const [currMarkdownContent, setCurrMarkdownContent] = useState("");
  const [markdownContent, setMarkdownContent] = useState("");
  const [activeTab, setActiveTab] = useState("split");
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
  const { isAuthenticated, user, logout } = useAuth();
  const isSmallScreen = useMediaQuery("(max-width:470px)");

  return (
    <div className="Preview min-h-screen flex flex-col bg-[#f6f8fa] text-black overflow-hidden">
      <header className="sticky top-0 left-0 w-full h-16 flex justify-between items-center px-4 md:px-6 bg-gradient-to-r from-[#011A29] via-[#022c45] to-[#011A29] text-white shadow-md z-10">
        {/* Left section with logo */}
        <div className="flex items-center cursor-pointer">
          <Tabs
            className="w-auto rounded-md"
            defaultValue="split"
            onValueChange={(value) => setActiveTab(value)}
          >
            <TabsList className="grid w-full grid-cols-3 gap-2 bg-[#011A29] px-2">
              <TabsTrigger
                value="editor"
                className="flex items-center justify-center transition-colors duration-200 focus:ring-2 focus:ring-blue-500"
              >
                <FaMarkdown className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger
                value="split"
                className="flex items-center justify-center transition-colors duration-200 focus:ring-2 focus:ring-blue-500"
              >
                <SquareSplitHorizontal className="h-5 w-5" />
              </TabsTrigger>
              <TabsTrigger
                value="preview"
                className="flex items-center justify-center transition-colors duration-200 focus:ring-2 focus:ring-blue-500"
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
          <button className="bg-[#005a7a] hover:bg-[#00445c] text-white font-semibold py-2 px-4 rounded flex items-center gap-2 text-sm transition-colors duration-200">
            <Upload className="h-4 w-4" />
            <span className="font-bold">Publish</span>
          </button>

          {isAuthenticated && (
            <UserDropdown userName={user.name} logout={logout} />
          )}
        </div>
      </header>

      <div className="flex flex-row w-screen h-[calc(100vh-64px)]">
        <div
          className={`flex flex-col ${
            activeTab === "editor" ? "w-full" : "w-1/2"
          } h-full ${activeTab != "preview" ? "block" : "hidden"}`}
        >
          <div className="w-full h-[50px] bg-[#011A29] text-white flex items-center justify-between px-4 shadow-sm">
            <div className="flex items-center gap-2 font-medium">
              <FileEdit size={16} className="text-blue-300" />
              <span className="tracking-wide">Editor</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-3 bg-gray-700/40 text-gray-300 px-2 py-1 rounded-md">
                <button
                  className="text-red-500"
                  onClick={() => {
                    setCurrMarkdownContent("");
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  className="text-gray-300"
                  onClick={() => {
                    navigator.clipboard.readText().then((text) => {
                      setCurrMarkdownContent(text);
                    });
                  }}
                >
                  <ClipboardPaste className="w-4 h-4" />
                </button>
              </div>
              <div className="bg-gray-700/40 text-gray-300 px-2 py-1 rounded-md flex items-center gap-1">
                <span className="text-blue-300 font-medium">
                  {currMarkdownContent.split(/\s+/).filter(Boolean).length}
                </span>
                <span>words</span>
              </div>
              <div className="bg-gray-700/40 text-gray-300 px-2 py-1 rounded-md flex items-center gap-1">
                <span className="text-green-300 font-medium">
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
              onChange={(value) => {
                handleMarkdownChange(value);
              }}
              className="h-[calc(100vh-64px-50px)] text-lg"
            />
          </div>
        </div>
        <div
          className={`flex flex-col h-full ${
            activeTab === "preview" ? "w-full" : "w-1/2"
          } ${activeTab != "editor" ? "block" : "hidden"}`}
        >
          <div className="w-full h-[50px] bg-[#011A29] text-white flex items-center justify-between px-4 shadow-sm">
            <div className="flex items-center gap-2 font-medium">
              <Pencil size={16} className="text-green-300" />
              <span className="tracking-wide">Preview</span>
            </div>
            {activeTab === "split" && <button
              onClick={handleRenderClick}
              className="flex items-center gap-1 bg-green-600/30 hover:bg-green-600/50 text-green-200 px-2.5 py-1 rounded-md font-medium transition-colors duration-200 text-sm"
            >
              <RefreshCw size={14} className={`mr-1 ${spin == true ? "animate-spin": ""}`} />
              Render
            </button>}
          </div>
          <Preview markdownContent={markdownContent} renderMarkdown={renderMarkdown} setRenderMarkdown={setRenderMarkdown} />
        </div>
      </div>
    </div>
  );
};

export default EditorPreview;
