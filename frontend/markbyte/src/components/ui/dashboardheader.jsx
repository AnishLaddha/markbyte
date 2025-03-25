import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import UserDropdown from "@/components/ui/profiledropdown";
import { useMediaQuery } from "@mui/material";
function DashboardHeader() {
  const { user, logout } = useAuth();
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
  );
}

export default DashboardHeader;
