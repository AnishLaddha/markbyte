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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const UserDropdown = ({ userName, logout }) => {
  const navigate = useNavigate();
  return (
    <DropdownMenu className="z-500 relative">
      <DropdownMenuTrigger>
        <Avatar className="cursor-pointer bg-gray-200">
        <AvatarImage src={`https://api.dicebear.com/9.x/initials/svg?seed=${userName}&backgroundType=gradientLinear`} />
        <AvatarFallback>{userName[0]}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="mr-8">
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
