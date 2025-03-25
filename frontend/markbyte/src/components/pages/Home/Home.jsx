import "./Home.css";
import React from "react";
import { CiLogin } from "react-icons/ci";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "@mui/material";
import { FaArrowRight } from "react-icons/fa";
import { RiMenu3Line } from "react-icons/ri";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ParticlesBackground from "@/components/ui/particles";

const Home = React.memo(function Home() {
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery("(max-width:470px)");
  const isSmallScreen2 = useMediaQuery("(max-width:611px)");
  const isSmallScreen3 = useMediaQuery("(min-width:611px)");

  return (
    <div className="App min-h-screen flex flex-col bg-[#011A29] text-white overflow-hidden">
      <ParticlesBackground id="particles" />
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
              href="/about"
              className="text-white font-semibold rounded text-lg transition-all duration-300 relative group"
            >
              About
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
            </a>
            <button
              className="text-white font-semibold rounded flex items-center justify-center text-lg transition-all duration-300 relative group"
              onClick={() => navigate("/auth?tab=login")}
            >
              Login <CiLogin className="ml-1 text-lg " />
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-400 transition-all duration-300 group-hover:w-full"></span>
            </button>
            <button
              className="bg-white hover:bg-gray-200 text-black font-semibold py-2 px-4 rounded min-w-[100px] transition-all duration-300 ease-in-out"
              onClick={() => navigate("/auth?tab=signup")}
            >
              Sign Up
            </button>
          </div>
        )}

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
      <main className="flex-grow relative z-10">
        <section className="text-white py-24 md:py-32 mt-24 md:mt-32 z-20">
          <div className="container mx-auto px-4 z-20">
            <div className="max-w-3xl mx-auto text-center z-10">
              <div className="relative">
                <h1 className="text-5xl md:text-6xl font-bold mb-4 leading-tight tracking-tight">
                  Welcome to{" "}
                  <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    MarkByte
                  </span>
                  .
                </h1>
                {isSmallScreen3 && (
                  <img
                    src="/assets/pen.png"
                    alt="Pen"
                    className="absolute -top-[200%] left-[46%] transform -translate-x-1/2 z-20 w-40 h-40"
                  />
                )}
              </div>
              <div className="tagline text-xl md:text-2xl mb-8 text-blue-100 font-light inline-block">
                <p>The future of blogging is written in Markdown</p>
              </div>
              <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6">
                <a
                  href="/auth?tab=signup"
                  className="flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-medium py-3 px-6 rounded-lg transition duration-300 shadow-lg hover:shadow-xl cursor-pointer group"
                >
                  <span className="mr-2">Upload Your First Blog</span>
                  <FaArrowRight size={13} />
                </a>
                <a
                  href="/about"
                  className="flex items-center justify-center cursor-pointer group relative py-3 px-6 border border-blue-400/30 rounded-lg hover:bg-blue-900/20 transition-all duration-300"
                >
                  <span className="relative inline-flex items-center">
                    Learn More
                    <FaArrowRight size={13} className="ml-2" />
                  </span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="py-4 text-center z-20">
        <p className="text-gray-400 text-sm">
          Group 1 - Rishab Pangal, Anish Laddha, Shrijan Swaminathan
        </p>
      </footer>
    </div>
  );
});
export default Home;
