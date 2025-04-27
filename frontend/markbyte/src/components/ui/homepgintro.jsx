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
    <div className="mx-8 flex flex-col sm:flex-row justify-between items-center gap-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="space-y-4"
      >
        <div className="flex items-start gap-5">
          <motion.div
            className="relative p-4 rounded-2xl bg-gradient-to-br from-[#084464] to-[#1e6188] shadow-lg"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <motion.div
              initial={{ rotate: -10, scale: 0.9 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              {pgVal === "home" && <Home className="h-7 w-7 text-white" />}
              {pgVal === "analytics" && (
                <ChartArea className="h-7 w-7 text-white" />
              )}
            </motion.div>
          </motion.div>

          <div className="space-y-2">
            <motion.h1
              className="text-3xl font-bold text-gray-900 leading-tight"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Welcome back,{" "}
              <motion.span
                className="bg-gradient-to-r from-[#084464] to-[#1A698F] text-transparent bg-clip-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                {name}
              </motion.span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              {pgVal === "home" && (
                <p className="text-gray-600 text-lg font-light leading-relaxed">
                  Craft new stories and manage your existing posts with ease.
                </p>
              )}
              {pgVal === "analytics" && (
                <p className="text-gray-600 text-lg font-light leading-relaxed">
                  Analyze your blog's performance and track your progress.
                </p>
              )}
            </motion.div>
          </div>
        </div>

        <motion.div
          className="h-1 w-24 bg-gradient-to-r from-[#084464] to-[#1A698F] rounded-full"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 96, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        />
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
                <Home className="h-5 w-5 min-h-5 min-w-5 flex-shrink-0" />
              </TabsTrigger>

              <TabsTrigger
                value="analytics"
                className="py-2.5 flex items-center justify-center transition-all duration-200 data-[state=active]:bg-gradient-to-br data-[state=active]:from-[#084464] data-[state=active]:to-[#0a5977] data-[state=active]:text-white rounded-lg"
              >
                <ChartArea className="h-5 w-5 min-h-5 min-w-5 flex-shrink-0" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </motion.div>
    </div>
  );
};

export default HomePageHeader;
