import React from "react";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "@mui/material";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu";
import { Separator } from "@/components/ui/separator";
import { CiLogin } from "react-icons/ci";

function NoAuthDashboardHeader() {
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

      <div className="flex-1 flex justify-end">
        <NavigationMenu>
          <NavigationMenuList className="flex gap-2">
            <NavigationMenuItem>
              <NavigationMenuTrigger className="text-black text-md px-3 py-2 rounded-md bg-white">
                Account
              </NavigationMenuTrigger>
              <NavigationMenuContent className="min-w-40 p-3 rounded-lg shadow-lg">
                <ul className="grid gap-1">
                  <li>
                    <NavigationMenuLink
                      href="/auth?tab=login"
                      className="block px-4 py-2 text-black rounded-md hover:bg-gray-100 transition-colors"
                    >
                      Login <CiLogin className="inline-block ml-1" />
                    </NavigationMenuLink>
                  </li>
                  <Separator/>
                  <li>
                    <NavigationMenuLink
                      href="/auth?tab=signup"
                      className="block px-4 py-2 text-black rounded-md hover:bg-gray-100 transition-colors"
                    >
                      Sign Up
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem className="relative">
              <NavigationMenuLink
                href="/"
                className="text-white text-md px-2 py-1 transition-all duration-300 hover:text-white/90"
              >
                Home
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem className="relative">
              <NavigationMenuLink
                href="/discover"
                className="text-white text-md px-2 py-1 transition-all duration-300 hover:text-white/90"
              >
                Discover
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem className="relative">
              <NavigationMenuLink
                href="/about"
                className="text-white text-md px-2 py-1 transition-all duration-300 hover:text-white/90"
              >
                About
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
          <NavigationMenuViewport />
        </NavigationMenu>
      </div>
    </header>
  );
}

export default NoAuthDashboardHeader;
