// Reused layout structure from ShadCN UI Area Chart - Interactive example:
// https://ui.shadcn.com/charts
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import useTimesData from "@/hooks/use-timesdata";
import useAnalyticData from "@/hooks/use-analyticdata";
import { analyticTableStaticCols } from "@/constants/TableStaticcols";
import AnalyticTable from "@/components/ui/analytictable";
import {
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Search, X, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";

const chartConfig = {
  view: {
    label: "Views",
    color: "#084464",
  },
};

function BloggerAnalytics() {
  const { timedata: timesData } = useTimesData();
  const { user } = useAuth();
  const { analyticdata: analyticsData } = useAnalyticData(user?.name);
  const [timeRange, setTimeRange] = useState("30d");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredanalyticdata = useMemo(() => {
    return analyticsData.filter((item) =>
      item.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [analyticsData, searchTerm]);

  const table = useReactTable({
    data: filteredanalyticdata,
    columns: analyticTableStaticCols,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 5,
      },
    },
  });

  useEffect(() => {
    table.setPageIndex(0);
  }, [analyticsData, searchTerm]);

  // Get time difference based on the selected time range in milliseconds
  const getDiff = () => {
    let millisecondsToSubtract = 2592000000;
    if (timeRange === "7d") {
      millisecondsToSubtract = 604800000;
    } else if (timeRange === "1d") {
      millisecondsToSubtract = 86400000;
    }
    return millisecondsToSubtract;
  };

  // Filter the timesData based on the selected time range
  // (makes use of function given by shadcn)
  const filteredData = (timesData ?? []).filter((item) => {
    const date = new Date(item.date);
    const now = new Date();
    const millisecondsToSubtract = getDiff();
    const startDate = new Date(now.getTime() - millisecondsToSubtract);
    return date >= startDate;
  });

  // Function to aggregate data based on the selected time range
  // and format it for the chart
  const aggregateData = (data) => {
    const aggregated = {};
    const now = new Date();
    const millisecondsToSubtract = getDiff();
    const startDate = new Date(now.getTime() - millisecondsToSubtract);
    if (timeRange === "1d") {
      const currentDate = new Date(startDate);
      currentDate.setMinutes(0, 0, 0);
      while (currentDate <= now) {
        const hour = currentDate.getHours();
        const dateStr = currentDate.toLocaleString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });
        const key = `${dateStr} ${hour}:00`;

        aggregated[key] = {
          date: key,
          view: 0,
        };
        currentDate.setHours(currentDate.getHours() + 1);
      }
    } else {
      let dayCount = 30;
      if (timeRange === "7d") {
        dayCount = 7;
      }
      const currentDate = new Date(startDate);
      const endDate = new Date(now);
      currentDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
      while (currentDate <= endDate) {
        const key = currentDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });

        aggregated[key] = {
          date: key,
          view: 0,
        };
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
    data.forEach((item) => {
      const itemDate = new Date(item.date);
      let key = "";

      if (timeRange === "1d") {
        const hour = itemDate.getHours();
        const dateStr = itemDate.toLocaleString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });
        key = `${dateStr} ${hour}:00`;
      } else {
        const dateStr = itemDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });
        key = dateStr;
      }

      if (aggregated[key]) {
        aggregated[key].view += 1;
      }
    });

    const result = Object.values(aggregated);
    result.sort((a, b) => new Date(a.date) - new Date(b.date));

    return result;
  };

  return (
    <div className="mx-8 mt-10 flex flex-col justify-center h-full">
      {/* Graph showing viewership over time across all posts*/}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <Card>
          <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
            <div className="grid flex-1 gap-1 text-center sm:text-left">
              <CardTitle>Viewership Across All Posts</CardTitle>
              <CardDescription>
                Showing total viewers for the last
                {timeRange === "1d"
                  ? " 24 hours"
                  : timeRange === "7d"
                  ? " 7 days"
                  : " 30 days"}
              </CardDescription>
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger
                className="w-[160px] rounded-lg sm:ml-auto"
                aria-label="Select a value"
              >
                <SelectValue placeholder="Last 1 month" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="30d" className="rounded-lg">
                  Last 1 month
                </SelectItem>
                <SelectItem value="7d" className="rounded-lg">
                  Last 7 days
                </SelectItem>
                <SelectItem value="1d" className="rounded-lg">
                  Last day
                </SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
            <ChartContainer
              config={chartConfig}
              className="aspect-auto h-[300px] w-full"
            >
              <AreaChart data={aggregateData(filteredData)}>
                <defs>
                  <linearGradient id="fillView" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-view)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-view)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={(value) => {
                    if (timeRange === "1d") {
                      return value.split(" ")[1];
                    } else {
                      const date = new Date(value);
                      return date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      });
                    }
                  }}
                />
                <YAxis
                  axisLine={false}
                  tickMargin={8}
                  tickLine={false}
                  tickFormatter={(value) =>
                    Number.isInteger(value) ? value : ""
                  }
                  width={40}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => {
                        if (timeRange === "1d") {
                          const date = new Date(value.split(" ")[0]);
                          return (
                            date.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            }) +
                            " " +
                            value.split(" ")[1]
                          );
                        } else {
                          return new Date(value).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          });
                        }
                      }}
                      valueFormatter={(value) => `${value} views`}
                      indicator="dot"
                    />
                  }
                />
                <Area
                  dataKey="view"
                  type="monotone"
                  fill="url(#fillView)"
                  stroke="var(--color-view, #084464)"
                  stackId="a"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </motion.div>
      {/* Table containing posts, date, views, and a link to the post's analytics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: "easeInOut" }}
        className="mt-8"
      >
        <Card className="w-full">
          <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
            <div className="grid flex-1 gap-1 text-center sm:text-left">
              <CardTitle>Post Analytics</CardTitle>
              <CardDescription>
                Showing all posts and their viewership
              </CardDescription>
            </div>
            <div className="flex items-center gap-1 mr-2 bg-gray-100 rounded-lg px-2 py-1 text-sm text-gray-500">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {timesData.length.toLocaleString()} Total Views
              </span>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="h-4 w-4 absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search posts..."
                className="pl-9 pr-10 h-9 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <X
                  className="h-4 w-4 absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-destructive cursor-pointer"
                  onClick={() => setSearchTerm("")}
                />
              )}
            </div>
          </CardHeader>
          <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
            <AnalyticTable table={table} />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

export default BloggerAnalytics;
