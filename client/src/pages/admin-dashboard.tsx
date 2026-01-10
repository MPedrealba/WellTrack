import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "wouter";
import {
  Users,
  AlertTriangle,
  TrendingUp,
  Activity,
  ArrowRight,
  Bell,
  Calendar,
  BarChart3,
} from "lucide-react";
import { getMoodEmoji } from "@/components/mood-emoji-picker";
import { getStressIcon } from "@/components/stress-level-picker";
import type { Alert, User, MoodEntry } from "@shared/schema";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { format, subDays, startOfDay, isAfter } from "date-fns";

interface DashboardStats {
  totalStudents: number;
  activeToday: number;
  totalAlerts: number;
  urgentAlerts: number;
  avgMood: number;
  avgStress: number;
}

interface AlertWithUser extends Alert {
  user: User;
}

interface MoodEntryWithUser extends MoodEntry {
  user: User;
}

const alertTypeColors: Record<string, string> = {
  urgent: "bg-red-500",
  concerning: "bg-orange-500",
  informational: "bg-blue-500",
};

const MOOD_COLORS = ["#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e"];

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/stats"],
  });

  const { data: alerts, isLoading: alertsLoading } = useQuery<AlertWithUser[]>({
    queryKey: ["/api/admin/alerts"],
  });

  const { data: recentEntries, isLoading: entriesLoading } = useQuery<MoodEntryWithUser[]>({
    queryKey: ["/api/admin/recent-entries"],
  });

  const unreadAlerts = alerts?.filter((a) => !a.isRead) || [];
  const urgentAlerts = unreadAlerts.filter((a) => a.alertType === "urgent");

  // Calculate mood distribution for pie chart based on ai_sentiment
  const moodDistribution = (() => {
    if (!recentEntries) return [];
    const sentimentCounts: Record<string, number> = {};
    recentEntries.forEach((entry) => {
      const sentiment = entry.aiSentiment || "Neutral";
      sentimentCounts[sentiment] = (sentimentCounts[sentiment] || 0) + 1;
    });
    return Object.entries(sentimentCounts).map(([name, value]) => ({
      name,
      value,
    }));
  })();

  // Calculate daily activity for bar chart (last 7 days)
  const dailyActivity = (() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayStart = startOfDay(date);
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      const count = recentEntries ? recentEntries.filter((e) => {
        const entryDate = new Date(e.createdAt);
        return entryDate >= dayStart && entryDate < dayEnd;
      }).length : 0;
      days.push({
        day: format(date, "EEE"),
        entries: count,
      });
    }
    return days;
  })();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor student wellness and manage alerts
          </p>
        </div>
        {urgentAlerts.length > 0 && (
          <Button asChild variant="destructive" data-testid="button-view-urgent">
            <Link href="/admin/alerts" className="gap-2">
              <Bell className="h-4 w-4" />
              {urgentAlerts.length} Urgent Alert{urgentAlerts.length !== 1 ? "s" : ""}
            </Link>
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold" data-testid="text-total-students">
                  {statsLoading ? <Skeleton className="h-8 w-12" /> : stats?.totalStudents || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                <Activity className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Today</p>
                <p className="text-2xl font-bold" data-testid="text-active-today">
                  {statsLoading ? <Skeleton className="h-8 w-12" /> : stats?.activeToday || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
                <AlertTriangle className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unread Alerts</p>
                <p className="text-2xl font-bold" data-testid="text-total-alerts">
                  {statsLoading ? <Skeleton className="h-8 w-12" /> : unreadAlerts.length}
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
                <p className="text-sm text-muted-foreground">Avg. Mood</p>
                <p className="text-2xl font-bold" data-testid="text-avg-mood">
                  {statsLoading ? (
                    <Skeleton className="h-8 w-12" />
                  ) : (
                    Number(stats?.avgMood || 0).toFixed(1)
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Daily Activity Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Daily Check-ins
            </CardTitle>
          </CardHeader>
          <CardContent>
            {entriesLoading ? (
              <Skeleton className="h-[250px] w-full" />
            ) : dailyActivity.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dailyActivity}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar
                    dataKey="entries"
                    name="Check-ins"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[250px] items-center justify-center text-muted-foreground">
                0 check-ins
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mood Distribution Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Mood Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {entriesLoading ? (
              <Skeleton className="h-[250px] w-full" />
            ) : moodDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={moodDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) =>
                      `${name} ${(Number(percent || 0) * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {moodDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={MOOD_COLORS[index % MOOD_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      borderColor: "hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[250px] items-center justify-center text-muted-foreground">
                0 entries
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Alerts */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Recent Alerts
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/alerts" className="gap-1">
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {alertsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : unreadAlerts.length > 0 ? (
              <div className="space-y-4">
                {unreadAlerts.slice(0, 5).map((alert) => (
                  <div
                    key={alert.id}
                    className="flex items-start gap-4 rounded-lg border p-4"
                    data-testid={`alert-${alert.id}`}
                  >
                    <div
                      className={`mt-1 h-3 w-3 rounded-full ${
                        alertTypeColors[alert.alertType] || "bg-gray-500"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">
                          {alert.user?.firstName} {alert.user?.lastName}
                        </span>
                        <Badge
                          variant={alert.alertType === "urgent" ? "destructive" : "secondary"}
                          className="text-xs capitalize"
                        >
                          {alert.alertType}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                        {alert.reason}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {format(new Date(alert.createdAt), "MMM d, h:mm a")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center text-muted-foreground">
                No unread alerts
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-500" />
              Recent Check-ins
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/students" className="gap-1">
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {entriesLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : recentEntries && recentEntries.length > 0 ? (
              <div className="space-y-3">
                {recentEntries.slice(0, 5).map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-3 rounded-lg border p-3"
                    data-testid={`entry-${entry.id}`}
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage
                        src={entry.user?.profileImageUrl || ""}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {entry.user?.firstName?.[0]}
                        {entry.user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate text-sm">
                          {entry.user?.firstName} {entry.user?.lastName}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(entry.createdAt), "MMM d, h:mm a")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getMoodEmoji(entry.moodLevel)}
                      {getStressIcon(entry.stressLevel)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center text-muted-foreground">
                No recent activity
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
