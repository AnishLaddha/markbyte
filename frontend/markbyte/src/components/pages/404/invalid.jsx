import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { MoveLeft } from 'lucide-react';

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#022438] p-6 text-center overflow-hidden relative">
      <div className="absolute left-1/4 top-1/4 h-[500px] w-[400px] -rotate-100 rounded-[150px] bg-blue-500 opacity-15 blur-[150px] z-0"></div>
      <div className="absolute left-[-15%] top-1/6 h-[450px] w-[350px] -rotate-15 rounded-[120px] bg-blue-500 opacity-10 blur-[130px] z-0"></div>
      <div className="absolute right-[-10%] bottom-1/4 h-[550px] w-[450px] rotate-40 rounded-[130px] bg-blue-500 opacity-10 blur-[140px] z-0"></div>
      <div className="relative">
        <img src="/assets/monkey.gif" className = "h-24 w-24"></img>
        <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-4 bg-black/20 rounded-full blur-sm"></span>
      </div>
      <div className="z-10 max-w-xl w-full">
        <div className="relative mb-6">
          <h1 className="text-[180px] font-black text-white/30 leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center"></div>
          </div>
        </div>

        {/* Content card */}
        <div className="backdrop-blur-sm bg-white/5 rounded-2xl border border-white/10 p-8 shadow-xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-300 mb-8 max-w-md mx-auto">
            Oops! The page you're looking for seems to have wandered off.
          </p>

          <Button
            asChild
            className="bg-white hover:bg-gray-200 text-[#022438] hover:text-[#022438] font-medium px-8 text-md"
          >
            <Link to="/" className="flex items-center gap-2">
              <MoveLeft size={16} />
              <span>Return Home</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
