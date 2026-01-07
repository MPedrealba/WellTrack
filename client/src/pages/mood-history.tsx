import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getMoodEmoji, getMoodLabel } from "@/components/mood-emoji-picker";
import { getStressIcon, getStressLabel } from "@/components/stress-level-picker";
import type { MoodEntry } from "@shared/schema";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
} from "recharts";
import { format, subDays, startOfDay, isAfter } from "date-fns";
import { Calendar, TrendingUp, Clock, FileText, ChevronLeft, ChevronRight } from "lucide-react";

type TimeRange = "7d" | "30d" | "90d";

export default function MoodHistory() {
  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [currentPage, setCurrentPage] = useState(0);
  const entriesPerPage = 10;

  const { data: moodEntries, isLoading } = useQuery<MoodEntry[]>({
    queryKey: ["/api/mood-entries"],
  });

  const getDaysFromRange = (range: TimeRange): number => {
    switch (range) {
      case "7d":
        return 7;
      case "30d":
        return 30;
      case "90d":
        return 90;
    }
  };

  const filterEntriesByRange = (entries: MoodEntry[], range: TimeRange) => {
    const days = getDaysFromRange(range);
    const cutoffDate = startOfDay(subDays(new Date(), days));
    return entries.filter((entry) =>
      isAfter(new Date(entry.createdAt), cutoffDate)
    );
  };

  const filteredEntries = moodEntries
    ? filterEntriesByRange(moodEntries, timeRange)
    : [];

  const chartData = filteredEntries
    .slice()
    .reverse()
    .map((entry) => ({
      date: format(new Date(entry.createdAt), "MMM d"),
      fullDate: format(new Date(entry.createdAt), "MMM d, yyyy"),
      mood: entry.moodLevel,
      stress: entry.stressLevel,
    }));

  // Calculate averages
  const avgMood = filteredEntries.length
    ? (
        filteredEntries.reduce((sum, e) => sum + e.moodLevel, 0) /
        filteredEntries.length
      ).toFixed(1)
    : "0";

  const avgStress = filteredEntries.length
    ? (
        filteredEntries.reduce((sum, e) => sum + e.stressLevel, 0) /
        filteredEntries.length
      ).toFixed(1)
    : "0";

  // Pagination
  const totalPages = Math.ceil((moodEntries?.length || 0) / entriesPerPage);
  const paginatedEntries = moodEntries
    ? moodEntries.slice(
        currentPage * entriesPerPage,
        (currentPage + 1) * entriesPerPage
      )
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Mood History</h1>
        <p className="text-muted-foreground">
          Track your emotional journey over time
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Mood</p>
                <p className="text-2xl font-bold" data-testid="text-avg-mood">
                  {isLoading ? <Skeleton className="h-8 w-12" /> : avgMood}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <TrendingUp className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Stress</p>
                <p className="text-2xl font-bold" data-testid="text-avg-stress">
                  {isLoading ? <Skeleton className="h-8 w-12" /> : avgStress}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                <FileText className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Entries</p>
                <p className="text-2xl font-bold" data-testid="text-total-entries">
                  {isLoading ? (
                    <Skeleton className="h-8 w-12" />
                  ) : (
                    moodEntries?.length || 0
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Section */}
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Mood & Stress Trends
          </CardTitle>
          <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
            <TabsList>
              <TabsTrigger value="7d" data-testid="tab-7days">7 Days</TabsTrigger>
              <TabsTrigger value="30d" data-testid="tab-30days">30 Days</TabsTrigger>
              <TabsTrigger value="90d" data-testid="tab-90days">90 Days</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="stressGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <YAxis
                  domain={[1, 5]}
                  ticks={[1, 2, 3, 4, 5]}
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  labelFormatter={(label, payload) =>
                    payload?.[0]?.payload?.fullDate || label
                  }
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="mood"
                  name="Mood"
                  stroke="hsl(var(--chart-1))"
                  fill="url(#moodGradient)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="stress"
                  name="Stress"
                  stroke="hsl(var(--chart-2))"
                  fill="url(#stressGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[300px] flex-col items-center justify-center text-center">
              <Calendar className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">No entries in this time range</p>
              <p className="text-sm text-muted-foreground">
                Start tracking to see your trends
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Entry List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Recent Entries
          </CardTitle>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                data-testid="button-prev-page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {currentPage + 1} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage >= totalPages - 1}
                data-testid="button-next-page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : paginatedEntries.length > 0 ? (
            <div className="space-y-4">
              {paginatedEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                  data-testid={`entry-${entry.id}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {format(new Date(entry.createdAt), "d")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(entry.createdAt), "MMM")}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        {getMoodEmoji(entry.moodLevel)}
                        <span className="font-medium">
                          {getMoodLabel(entry.moodLevel)}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          Mood
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStressIcon(entry.stressLevel)}
                        <span className="font-medium">
                          {getStressLabel(entry.stressLevel)}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          Stress
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(entry.createdAt), "h:mm a")}
                    </span>
                    {entry.journalEntry && (
                      <Badge variant="outline" className="text-xs">
                        Has journal entry
                      </Badge>
                    )}
                    {entry.aiSentiment && (
                      <Badge className="text-xs bg-primary/20 text-primary hover:bg-primary/30">
                        {entry.aiSentiment}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-[200px] flex-col items-center justify-center text-center">
              <FileText className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">No entries yet</p>
              <p className="text-sm text-muted-foreground">
                Start your first check-in to begin tracking
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
