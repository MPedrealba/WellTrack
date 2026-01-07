import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import {
  PenSquare,
  Flame,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Lightbulb,
  ArrowRight,
  Heart,
  Activity,
} from "lucide-react";
import { getMoodEmoji, getMoodLabel } from "@/components/mood-emoji-picker";
import { getStressIcon, getStressLabel } from "@/components/stress-level-picker";
import type { MoodEntry, WellnessTip } from "@shared/schema";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format, parseISO, differenceInDays, subDays, isToday } from "date-fns";

function calculateStreak(entries: MoodEntry[]): number {
  if (!entries || entries.length === 0) return 0;
  
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Check if there's an entry today
  const latestEntry = sortedEntries[0];
  const latestDate = new Date(latestEntry.createdAt);
  
  if (!isToday(latestDate)) {
    // If no entry today, check if the streak was broken
    const daysSinceLastEntry = differenceInDays(new Date(), latestDate);
    if (daysSinceLastEntry > 1) return 0;
  }

  let streak = 1;
  for (let i = 1; i < sortedEntries.length; i++) {
    const currentDate = new Date(sortedEntries[i - 1].createdAt);
    const prevDate = new Date(sortedEntries[i].createdAt);
    const daysDiff = differenceInDays(currentDate, prevDate);
    
    if (daysDiff === 1 || daysDiff === 0) {
      if (daysDiff === 1) streak++;
    } else {
      break;
    }
  }

  return streak;
}

function getMoodTrend(entries: MoodEntry[]): "up" | "down" | "stable" {
  if (!entries || entries.length < 3) return "stable";
  
  const recent = entries.slice(0, 3);
  const older = entries.slice(3, 6);
  
  if (older.length === 0) return "stable";
  
  const recentAvg = recent.reduce((sum, e) => sum + e.moodLevel, 0) / recent.length;
  const olderAvg = older.reduce((sum, e) => sum + e.moodLevel, 0) / older.length;
  
  const diff = recentAvg - olderAvg;
  if (diff > 0.3) return "up";
  if (diff < -0.3) return "down";
  return "stable";
}

export default function StudentDashboard() {
  const { user } = useAuth();
  
  const { data: moodEntries, isLoading: entriesLoading } = useQuery<MoodEntry[]>({
    queryKey: ["/api/mood-entries"],
  });

  const { data: dailyTip, isLoading: tipLoading } = useQuery<WellnessTip>({
    queryKey: ["/api/wellness-tips/daily"],
  });

  const streak = moodEntries ? calculateStreak(moodEntries) : 0;
  const hasCheckedInToday = moodEntries?.some((e) => isToday(new Date(e.createdAt)));
  const moodTrend = moodEntries ? getMoodTrend(moodEntries) : "stable";

  // Prepare chart data (last 7 days)
  const chartData = moodEntries
    ? moodEntries.slice(0, 7).reverse().map((entry) => ({
        date: format(new Date(entry.createdAt), "MMM d"),
        mood: entry.moodLevel,
        stress: entry.stressLevel,
      }))
    : [];

  const latestEntry = moodEntries?.[0];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">
            Welcome back, {user?.firstName || "Student"}
          </h1>
          <p className="text-muted-foreground">
            {hasCheckedInToday
              ? "You've already checked in today. Great job!"
              : "How are you feeling today? Take a moment to check in."}
          </p>
        </div>
        <Button asChild size="lg" data-testid="button-quick-checkin">
          <Link href="/check-in" className="gap-2">
            <PenSquare className="h-5 w-5" />
            {hasCheckedInToday ? "Add Another Entry" : "Daily Check-in"}
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Streak Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
                <Flame className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Check-in Streak</div>
                <div className="text-2xl font-bold" data-testid="text-streak-count">
                  {entriesLoading ? <Skeleton className="h-8 w-12" /> : `${streak} day${streak !== 1 ? "s" : ""}`}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Mood Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Latest Mood</div>
                {entriesLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : latestEntry ? (
                  <div className="flex items-center gap-2">
                    {getMoodEmoji(latestEntry.moodLevel)}
                    <span className="text-lg font-semibold" data-testid="text-current-mood">
                      {getMoodLabel(latestEntry.moodLevel)}
                    </span>
                  </div>
                ) : (
                  <div className="text-lg font-semibold text-muted-foreground">No data</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Stress Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Activity className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Latest Stress</div>
                {entriesLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : latestEntry ? (
                  <div className="flex items-center gap-2">
                    {getStressIcon(latestEntry.stressLevel)}
                    <span className="text-lg font-semibold" data-testid="text-current-stress">
                      {getStressLabel(latestEntry.stressLevel)}
                    </span>
                  </div>
                ) : (
                  <div className="text-lg font-semibold text-muted-foreground">No data</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trend Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className={`flex h-12 w-12 items-center justify-center rounded-full ${
                moodTrend === "up"
                  ? "bg-emerald-100 dark:bg-emerald-900/30"
                  : moodTrend === "down"
                  ? "bg-red-100 dark:bg-red-900/30"
                  : "bg-muted"
              }`}>
                {moodTrend === "up" ? (
                  <TrendingUp className="h-6 w-6 text-emerald-500" />
                ) : moodTrend === "down" ? (
                  <TrendingDown className="h-6 w-6 text-red-500" />
                ) : (
                  <Minus className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Mood Trend</div>
                <div className="text-lg font-semibold" data-testid="text-mood-trend">
                  {moodTrend === "up"
                    ? "Improving"
                    : moodTrend === "down"
                    ? "Declining"
                    : "Stable"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Mood Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Mood & Stress History
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/history" className="gap-1">
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {entriesLoading ? (
              <Skeleton className="h-[250px] w-full" />
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
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
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="mood"
                    name="Mood"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-1))" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="stress"
                    name="Stress"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-2))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[250px] flex-col items-center justify-center text-center">
                <Calendar className="mb-4 h-12 w-12 text-muted-foreground/50" />
                <p className="text-muted-foreground">No mood data yet</p>
                <p className="text-sm text-muted-foreground">
                  Start tracking to see your trends
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Daily Wellness Tip */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Daily Wellness Tip
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tipLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-20 w-full" />
              </div>
            ) : dailyTip ? (
              <div className="space-y-3">
                <h3 className="font-semibold" data-testid="text-tip-title">
                  {dailyTip.title}
                </h3>
                <p className="text-sm text-muted-foreground" data-testid="text-tip-content">
                  {dailyTip.content}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="font-semibold">Take a Deep Breath</h3>
                <p className="text-sm text-muted-foreground">
                  When you feel overwhelmed, try the 4-7-8 breathing technique: 
                  Inhale for 4 seconds, hold for 7 seconds, and exhale for 8 seconds. 
                  This can help calm your nervous system.
                </p>
              </div>
            )}
            <Button variant="outline" className="mt-4 w-full" asChild>
              <Link href="/resources">
                Explore More Resources
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights Section */}
      {latestEntry?.aiInsights && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground" data-testid="text-ai-insights">
              {latestEntry.aiInsights}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
