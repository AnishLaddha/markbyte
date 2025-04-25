import React from "react";
import { useNavigate } from "react-router-dom";
import UserDropdown from "@/components/ui/profiledropdown";
import { useMediaQuery } from "@mui/material";
function DashboardHeader() {
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery("(max-width:470px)");
  return (
    <header className="sticky top-0 left-0 w-full h-16 flex justify-between items-center px-4 md:px-6 bg-[#084464] text-white shadow-md z-10">
      <div
        className="flex items-center cursor-pointer"
        onClick={() => navigate("/")}
      >
        <img
          src="/assets/markbytealt.png"
          alt="MarkByte Logo"
          className="h-10 w-auto"
        />
        {!isSmallScreen && (
          <span className="text-2xl font-semibold">arkByte</span>
        )}
      </div>

      <div className="flex items-center gap-4">
      <a
          href="/"
          className="text-white text-md px-2 py-1 transition-all duration-300 relative group"
        >
          Home
          <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
        </a>
        <a
          href="/discover"
          className="text-white text-md px-2 py-1 transition-all duration-300 relative group"
        >
          Discover
          <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
        </a>
        <UserDropdown />
      </div>
    </header>
  );
}

export default DashboardHeader;
