import React from "react";
import { CiLogout } from "react-icons/ci";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";

const UserDropdown = ({ userName, logout, name, pfp }) => {
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2}}
      >
        <DropdownMenuTrigger className="cursor-pointer rounded-full overflow-hidden">
          <Avatar className="w-10 h-10 rounded-full overflow-hidden">
            <AvatarImage
              src={
                pfp ||
                `https://api.dicebear.com/9.x/initials/svg?seed=${name}&backgroundType=gradientLinear`
              }
              alt="Profile preview"
              className="w-full h-full object-cover"
            />
            <AvatarFallback>{name?.charAt(0)}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
      </motion.div>

      <DropdownMenuContent
        className="w-56 p-2 shadow-lg rounded-xl border border-gray-100 dark:border-gray-800"
        align="end"
      >
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar className="w-10 h-10 rounded-full overflow-hidden">
            <AvatarImage
              src={
                pfp ||
                `https://api.dicebear.com/9.x/initials/svg?seed=${name}&backgroundType=gradientLinear`
              }
              alt="Profile preview"
              className="w-full h-full object-cover"
            />
            <AvatarFallback>{name?.charAt(0)}</AvatarFallback>
          </Avatar>

          <div className="flex flex-col">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {userName || "User"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Account Settings
            </p>
          </div>
        </div>

        <DropdownMenuSeparator className="my-1" />

        <DropdownMenuItem
          className="flex items-center gap-2 cursor-pointer p-2 m-1 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
          onClick={() => navigate("/profile")}
        >
          <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          <span>My Profile</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1" />

        <DropdownMenuItem
          className="flex items-center gap-2 cursor-pointer p-2 m-1 text-sm text-red-600 hover:bg-red-50 dark:text-red-500 dark:hover:bg-red-900/20 rounded-md transition-colors"
          onClick={() => {
            logout();
            navigate("/");
          }}
        >
          <CiLogout className="h-4 w-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
