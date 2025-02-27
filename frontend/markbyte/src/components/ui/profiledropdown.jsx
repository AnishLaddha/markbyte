import React from "react";
import { CiLogout } from "react-icons/ci";
import { WiDaySunny } from "react-icons/wi";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

const UserDropdown = ({ userName, logout }) => {
  const navigate = useNavigate();
  return (
    <DropdownMenu className="z-500 relative">
      <DropdownMenuTrigger className="w-11 h-11 bg-white rounded-full flex items-center justify-center mr-2 cursor-pointer focus:outline-none active:ring-0 text-[#005a7a]">
        <span className="font-bold text-lg text-[#005a7a]">
          {userName.charAt(0).toUpperCase()}
        </span>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="mr-10">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="flex items-center cursor-pointer"
          onClick={() => {
            logout();
            navigate("/");
          }}
        >
          Logout
          <CiLogout />
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
          <button className="flex items-center text-sm text-gray-700">
            Toggle Dark Mode
            <WiDaySunny className="ml-1 text-gray-500 text-base" />
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
