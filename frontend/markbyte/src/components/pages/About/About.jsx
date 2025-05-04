/* This is our site's about page.*/
import {
  Upload,
  Edit,
  Palette,
  Users,
  User,
  Home,
  History,
  ExternalLink,
} from "lucide-react";
import { FaFileArchive, FaMarkdown } from "react-icons/fa";
import { SiGithub } from "react-icons/si";
import { CiLogin } from "react-icons/ci";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMediaQuery } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { RiMenu3Line } from "react-icons/ri";
import { FaArrowRight } from "react-icons/fa";
function About() {
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery("(max-width:470px)");
  const isSmallScreen2 = useMediaQuery("(max-width:611px)");
  return (
    <div className="relative min-h-screen flex flex-col bg-[#011A29] text-white overflow-hidden">
      <div className="absolute left-1/4 top-1/4 h-[500px] w-[400px] -rotate-100 rounded-[150px] bg-blue-500 opacity-15 blur-[150px] z-0"></div>
      <div className="absolute left-[-15%] top-1/6 h-[450px] w-[350px] -rotate-15 rounded-[120px] bg-blue-500 opacity-10 blur-[130px] z-0"></div>
      <div className="absolute right-[-10%] bottom-1/4 h-[550px] w-[450px] rotate-40 rounded-[130px] bg-blue-500 opacity-10 blur-[140px] z-0"></div>
      <header className="header">
        <div className="logo-container" onClick={() => navigate("/")}>
          <img
            src="/assets/markbytealt.png"
            alt="MarkByte Logo"
            className="page-logo-2"
          />
          {!isSmallScreen && (
            <span className="text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              arkByte
            </span>
          )}
        </div>
        {!isSmallScreen2 && (
          <div className="flex gap-6 items-center">
             <a
              href="/"
              className="text-white font-semibold rounded text-lg transition-all duration-300 relative group"
            >
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a
              href="/discover"
              className="text-white font-semibold rounded text-lg transition-all duration-300 relative group"
            >
              Discover
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a
              href="/about"
              className="text-white font-semibold rounded text-lg transition-all duration-300 relative group"
            >
              About
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
            </a>
            
          </div>
        )}

        {/* Hamburger Menu for Small Screens */}
        {isSmallScreen2 && (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-700/30 hover:bg-blue-700/50 transition-colors duration-200">
              <RiMenu3Line className="text-xl" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-auto bg-[#01263b] border border-blue-500/30 text-white"
            >
              <DropdownMenuGroup>
                <DropdownMenuItem
                  className="focus:bg-blue-800/50 hover:bg-blue-800/30 cursor-pointer"
                  onClick={() => navigate("/about")}
                >
                  <span className="flex items-center gap-2">About</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="focus:bg-blue-800/50 hover:bg-blue-800/30 cursor-pointer"
                  onClick={() => navigate("/discover")}
                >
                  <span className="flex items-center gap-2">Discover</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="focus:bg-blue-800/50 hover:bg-blue-800/30 cursor-pointer"
                  onClick={() => navigate("/auth?tab=login")}
                >
                  <span className="flex items-center">Login</span>
                  <CiLogin className="text-lg text-blue-300" />
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-blue-500/30" />
                <DropdownMenuItem
                  className="bg-blue-600 hover:bg-blue-700 focus:bg-blue-700 cursor-pointer rounded-md mt-2"
                  onClick={() => navigate("/auth?tab=signup")}
                >
                  <span className="flex items-center gap-2 mx-auto font-medium">
                    Sign Up
                    <FaArrowRight size={10} />
                  </span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </header>
      <div className="container mx-auto px-6 mt-4 mb-9 relative z-10 max-w-4xl">
        <div className="space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold tracking-tight">
              About Markbyte
            </h1>
            <div className="h-1 w-20 bg-blue-500 mx-auto rounded-full"></div>
          </div>

          {/* Introduction */}
          <div className="space-y-6 text-lg leading-relaxed">
            <p>
              Markbyte is a free, open-source platform for hosting long-form
              text using simple, clean Markdown. Whether you're writing essays,
              guides, notes, or stories, Markbyte gives you a distraction-free
              space to publish without the noise.
            </p>
            <p>
              Every post gets its own unique, shareable URL—so you can just
              start writing and hit publish. Unlike platforms like Substack or
              Medium, Markbyte is entirely open source and forever free. We
              don't lock your content behind paywalls, limit features based on
              subscriptions, or gatekeep access as you scale.
            </p>
            <p>
              And unlike GitHub Pages or WordPress, you don't need to set up a
              repo, configure a theme, or deal with complex dashboards just to
              publish a post. Markbyte is built for people who want to write,
              not manage a website.
            </p>
            <p className="font-medium text-blue-300">
              We believe publishing should be simple, accessible, and under your
              control—and that's exactly what we've built.
            </p>
          </div>

          {/* Developers */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">The Developers</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl hover:bg-white/10 transition-colors">
                <h3 className="text-xl font-semibold mb-2">Anish Laddha</h3>
                <a
                  href="https://anomalish.xyz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-300 hover:text-blue-200 transition-colors"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  anomalish.xyz
                </a>
              </div>
              <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl hover:bg-white/10 transition-colors">
                <h3 className="text-xl font-semibold mb-2">Rishab Pangal</h3>
                <span className="text-gray-400 text-sm">Links coming soon</span>
              </div>
              <div className="bg-white/5 backdrop-blur-sm p-6 rounded-xl hover:bg-white/10 transition-colors">
                <h3 className="text-xl font-semibold mb-2">
                  Shrijan Swaminathan
                </h3>
                <span className="text-gray-400 text-sm">Links coming soon</span>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-500/20 p-2 rounded-lg">
                  <Upload className="h-6 w-6 text-blue-300" />
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-1">Markdown uploads</h3>
                  <p className="text-gray-300">
                    Quickly upload your .md files and publish instantly.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-blue-500/20 p-2 rounded-lg">
                  <FaFileArchive className="h-6 w-6 text-blue-300" />
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-1">ZIP file uploads</h3>
                  <p className="text-gray-300">
                    Upload bundled content with images for richer posts.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-blue-500/20 p-2 rounded-lg">
                  <SiGithub className="h-6 w-6 text-blue-300" />
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-1">GitHub imports</h3>
                  <p className="text-gray-300">
                    Import and publish your GitHub docs in seconds.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-blue-500/20 py-1 px-2 rounded-lg">
                  <Edit className="h-8 w-8 text-blue-300" />
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-1">
                    In-browser editor
                  </h3>
                  <p className="text-gray-300">
                    Write and edit your posts directly from your browser—no
                    setup needed.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-blue-500/20 p-2 rounded-lg">
                  <FaMarkdown className="h-6 w-6 text-blue-300" />
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-1">
                    Markdown renderer
                  </h3>
                  <p className="text-gray-300">
                    See your formatted post exactly as your readers will.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-blue-500/20 py-1 px-2 rounded-lg">
                  <Palette className="h-8 w-8 text-blue-300" />
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-1">
                    Multiple styling options
                  </h3>
                  <p className="text-gray-300">
                    Choose from themes to match your vibe, from minimalist to
                    futuristic.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-blue-500/20 p-2 rounded-lg">
                  <Users className="h-6 w-6 text-blue-300" />
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-1">
                    Discover all users
                  </h3>
                  <p className="text-gray-300">
                    Browse and explore what others are writing on Markbyte.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-blue-500/20 p-2 rounded-lg">
                  <User className="h-6 w-6 text-blue-300" />
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-1">An About page</h3>
                  <p className="text-gray-300">
                    Share more about yourself with a customizable author bio.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-blue-500/20 p-2 rounded-lg">
                  <Home className="h-6 w-6 text-blue-300" />
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-1">Landing page</h3>
                  <p className="text-gray-300">
                    Each user gets a personalized homepage with all their posts.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-blue-500/20 p-2 rounded-lg">
                  <History className="h-6 w-6 text-blue-300" />
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-1">Version control</h3>
                  <p className="text-gray-300">
                    Track changes to your posts and revert anytime.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <a
              href="/auth?tab=signup"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
            >
              Start Writing Today
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
