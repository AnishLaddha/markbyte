import { motion } from "framer-motion";
import { Home, ChartArea } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";

const HomePageHeader = ({ pgVal, name, handlePageTabChange }) => {
  const [activeTab, setActiveTab] = useState(pgVal);

  useEffect(() => {
    setActiveTab(pgVal);
  }, [pgVal]);

  const handleTabChange = (val) => {
    setActiveTab(val);
    handlePageTabChange(val);
  };
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
            {pgVal === "analytics" && (
              <ChartArea className="h-6 w-6 text-white" />
            )}
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
        <div className="w-full">
          <Tabs
            defaultValue="home"
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full max-w-[300px] rounded-md"
          >
            <TabsList className="grid w-full grid-cols-2 gap-1 bg-gray-200 p-1 rounded-xl h-12">
              <TabsTrigger
                value="home"
                className="py-2.5 flex items-center justify-center transition-all duration-200 data-[state=active]:bg-gradient-to-br data-[state=active]:from-[#084464] data-[state=active]:to-[#0a5977] data-[state=active]:text-white rounded-lg"
              >
                <Home className="h-5 w-5" />
              </TabsTrigger>

              <TabsTrigger
                value="analytics"
                className="py-2.5 flex items-center justify-center transition-all duration-200 data-[state=active]:bg-gradient-to-br data-[state=active]:from-[#084464] data-[state=active]:to-[#0a5977] data-[state=active]:text-white rounded-lg"
              >
                <ChartArea className="h-5 w-5" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </motion.div>
    </div>
  );
};

export default HomePageHeader;
