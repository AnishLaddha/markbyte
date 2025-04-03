import { motion } from "framer-motion";
import { Home, BarChart2 } from "lucide-react";

const HomePageHeader = ({ pgVal, name, handlePageTabChange }) => {
  return (
    <div className="mx-8 flex justify-between items-center gap-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <div className="flex items-center gap-4 mb-2">
          <div className="p-3 rounded-full bg-gradient-to-r from-[#084464] to-[#1e6188]">
            {pgVal === "home" && <Home className="h-6 w-6 text-white" />}
            {pgVal === "analytics" && <BarChart2 className="h-6 w-6 text-white" />}
          </div>
          <h1 className="text-3xl font-semibold text-gray-900 leading-tight">
            Welcome back,{" "}
            <span className="bg-gradient-to-r from-[#084464] to-[#1A698F] text-transparent bg-clip-text">
              {name}
            </span>
            !
          </h1>
        </div>
        {pgVal === "home" && (
          <p className="text-gray-700 text-lg leading-relaxed">
            Craft new stories and manage your existing posts with ease.
          </p>
        )}
        {pgVal === "analytics" && (
          <p className="text-gray-700 text-lg leading-relaxed">
            Analyze your blog's performance and track your progress.
          </p>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="font-['DM_Sans']"
      >
        <ul className="flex flex-wrap text-sm font-medium border-b border-gray-300">
          <li className="mr-2">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handlePageTabChange("home");
              }}
              aria-current={pgVal === "home" ? "page" : undefined}
              className={`inline-flex items-center gap-2 px-5 py-3 rounded-t-lg transition-all duration-300 ${
                pgVal === "home"
                  ? "text-white bg-[#003b5c] border-[#003b5c]"
                  : "text-gray-600 hover:bg-gray-200 hover:text-[#003b5c]"
              }`}
            >
              <Home size={18} />
              <span>Home</span>
            </a>
          </li>
          <li className="mr-2">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handlePageTabChange("analytics");
              }}
              aria-current={pgVal === "analytics" ? "page" : undefined}
              className={`inline-flex items-center gap-2 px-5 py-3 rounded-t-lg transition-all duration-300 ${
                pgVal === "analytics"
                  ? "text-white bg-[#003b5c] border-[#003b5c]"
                  : "text-gray-600 hover:bg-gray-200 hover:text-[#003b5c]"
              }`}
            >
              <BarChart2 size={18} />
              <span>Analytics</span>
            </a>
          </li>
        </ul>
      </motion.div>
    </div>
  );
};

export default HomePageHeader;
