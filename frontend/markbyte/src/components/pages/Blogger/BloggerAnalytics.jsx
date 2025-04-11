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
import { useState } from "react";
import { motion } from "framer-motion";
import useTimesData from "@/hooks/use-timesdata";

const chartConfig = {
  view: {
    label: "Views",
    color: "#084464",
  },
};

function BloggerAnalytics() {
  const { timedata: timesData } = useTimesData();
  const [timeRange, setTimeRange] = useState("30d");

  const filteredData = (timesData ?? []).filter((item) => {
    const date = new Date(item.date);
    const now = new Date();
    let millisecondsToSubtract = 2592000000;

    if (timeRange === "7d") {
      millisecondsToSubtract = 604800000;
    } else if (timeRange === "1d") {
      millisecondsToSubtract = 86400000;
    }

    const startDate = new Date(now.getTime() - millisecondsToSubtract);

    return date >= startDate;
  });

  const aggregateData = (data) => {
    const aggregated = {};

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

        if (!aggregated[key]) {
          aggregated[key] = {
            date: key,
            displayLabel: `${hour}:00`,
            view: 0,
          };
        }
      } else {
        const dateStr = itemDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });
        key = dateStr;
        if (!aggregated[key]) {
          aggregated[key] = {
            date: key,
            view: 0,
          };
        }
      }

      aggregated[key].view += item.view;
    });

    const result = Object.values(aggregated);
    result.sort((a, b) => new Date(a.date) - new Date(b.date));

    return result;
  };

  return (
    <div className="mx-8 mt-10 flex flex-col justify-center h-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
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
                      return value.split(" ")[1]; // just show HH:00
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
                  tickFormatter={(value) => `${value}`}
                  width={40}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => {
                        if (timeRange === "1d") {
                          const date = new Date(value.split(" ")[0]);
                          return date.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          }) + " " + value.split(" ")[1];
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
                  type="natural"
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
  );
}

export default BloggerAnalytics;
