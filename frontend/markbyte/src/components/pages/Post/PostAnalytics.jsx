// Reused layout structure from ShadCN UI Area Chart - Interactive example:
// https://ui.shadcn.com/charts
import usePostAnalyticData from "@/hooks/use-postanalytics";
import { useParams } from "react-router-dom";
import DashboardHeader from "@/components/ui/dashboardheader";
import { Calendar, Eye, TrendingUp, TrendingDown } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  view: {
    label: "Views",
    color: "#084464",
  },
};

function PostAnalytics() {
  // get the post name and user from URL
  const { user, post } = useParams();
  const { panalyticdata, monthuptick, weekuptick, monthtotal, weektotal } =
    usePostAnalyticData(post, user);
  const [timeRange, setTimeRange] = useState("30d");

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
  const filteredData = (panalyticdata.timestamps ?? []).filter((item) => {
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
    <div className="PostAnalytics relative min-h-screen overflow-x-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      <DashboardHeader />

      <div className="container mx-auto py-8 px-4">
        <div className="mx-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-800 relative inline-block">
            Post Performance
            <span className="absolute -bottom-1 left-0 w-1/3 h-1 bg-gradient-to-r from-blue-900 to-blue-200 rounded-full"></span>
          </h1>

          <p className="text-gray-500 mt-2">
            Track your post's performance and analytics over time.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          exit={{ opacity: 0, y: 20 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mx-8"
        >
          {/* Main Post Card */}
          <Card className="bg-gradient-to-br from-purple-50 to-blue-50 shadow-md border-2 border-gray-300">
            <CardHeader className="pb-2">
              <div className="flex flex-col space-y-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <CardTitle className="text-gray-800 text-xl flex-1 break-words">
                    {panalyticdata?.title || "Where is My Title???"}
                  </CardTitle>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-sm font-medium bg-purple-200 text-purple-800 whitespace-nowrap flex-shrink-0">
                    v{panalyticdata?.version || "0"}
                  </span>
                </div>
              </div>

              <CardDescription className="flex items-center text-gray-500">
                <Calendar className="h-4 w-4 mr-1" />
                <span>
                  Published{" "}
                  {new Date(panalyticdata?.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col">
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-gray-800">
                    {panalyticdata?.timestamps?.length || 0}
                  </span>
                </div>
                <div className="flex items-center text-gray-500 mt-1">
                  <Eye className="h-4 w-4 mr-1" />
                  <span>Total views</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Monthly Uptick Card */}
          <Card className="bg-gradient-to-br from-purple-50 to-blue-50 shadow-md border-2 border-gray-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-gray-800 text-base">
                Monthly Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col">
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-gray-800">
                    {monthtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-col mt-2">
                  <div className="flex items-center text-gray-500">
                    <Eye className="h-4 w-4 mr-1" />
                    <span>This month</span>
                  </div>
                  <div
                    className={`flex items-center mt-1 ${
                      monthuptick > 0 ? "text-emerald-500" : "text-red-500"
                    }`}
                  >
                    {monthuptick > 0 ? (
                      <>
                        <TrendingUp className="h-4 w-4 mr-1" />
                        <span className="font-medium">
                          +{monthuptick}% from last month
                        </span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-4 w-4 mr-1" />
                        <span className="font-medium">
                          {monthuptick}% from last month
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Uptick Card */}
          <Card className="bg-gradient-to-br from-purple-50 to-blue-50 shadow-md border-2 border-gray-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-gray-800 text-base">
                Weekly Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col">
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-gray-800">
                    {weektotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-col mt-2">
                  <div className="flex items-center text-gray-500">
                    <Eye className="h-4 w-4 mr-1" />
                    <span>This week</span>
                  </div>
                  <div
                    className={`flex items-center mt-1 ${
                      weekuptick > 0 ? "text-emerald-500" : "text-red-500"
                    }`}
                  >
                    {weekuptick > 0 ? (
                      <>
                        <TrendingUp className="h-4 w-4 mr-1" />
                        <span className="font-medium">
                          +{weekuptick}% from last week
                        </span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-4 w-4 mr-1" />
                        <span className="font-medium">
                          {weekuptick}% from last week
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-8 mt-8"
        >
          <Card>
            <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
              <div className="grid flex-1 gap-1 text-center sm:text-left">
                <CardTitle>Viewership for {panalyticdata.title}</CardTitle>
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
                    allowDecimals={false}
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
      </div>
    </div>
  );
}

export default PostAnalytics;
