import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getMoodEmoji, getMoodLabel } from "@/components/mood-emoji-picker";
import { getStressIcon, getStressLabel } from "@/components/stress-level-picker";
import type { User, MoodEntry } from "@shared/schema";
import {
  Users,
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Activity,
  AlertTriangle,
} from "lucide-react";
import { format, subDays, isAfter, differenceInDays, isToday } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface StudentWithStats extends User {
  moodEntries: MoodEntry[];
  streak: number;
  avgMood: number;
  avgStress: number;
  lastCheckIn: string | null;
  trend: "up" | "down" | "stable";
  hasAlert: boolean;
}

export default function AdminStudents() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<StudentWithStats | null>(null);

  const { data: students, isLoading } = useQuery<StudentWithStats[]>({
    queryKey: ["/api/admin/students"],
  });

  const filteredStudents = students?.filter((student) => {
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
    const email = student.email?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || email.includes(query);
  });

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-emerald-500" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  // Prepare chart data for selected student
  const studentChartData = selectedStudent?.moodEntries
    ?.slice(0, 14)
    .reverse()
    .map((entry) => ({
      date: format(new Date(entry.createdAt), "MMM d"),
      mood: entry.moodLevel,
      stress: entry.stressLevel,
    }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Students</h1>
          <p className="text-muted-foreground">
            View and monitor student wellness data
          </p>
        </div>
        <Badge variant="secondary" className="gap-1 self-start">
          <Users className="h-3 w-3" />
          {students?.length || 0} Total Students
        </Badge>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search students by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
          data-testid="input-search-students"
        />
      </div>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Student Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredStudents && filteredStudents.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Last Check-in</TableHead>
                    <TableHead>Mood</TableHead>
                    <TableHead>Stress</TableHead>
                    <TableHead>Trend</TableHead>
                    <TableHead>Streak</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id} data-testid={`row-student-${student.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={student.profileImageUrl || ""}
                              className="object-cover"
                            />
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {student.firstName?.[0]}
                              {student.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {student.firstName} {student.lastName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {student.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {student.lastCheckIn ? (
                          <span className="text-sm">
                            {format(new Date(student.lastCheckIn), "MMM d, h:mm a")}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">Never</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getMoodEmoji(Math.round(Number(student.avgMood || 0)))}
                          <span className="text-sm">{Number(student.avgMood || 0).toFixed(1)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getStressIcon(Math.round(student.avgStress))}
                          <span className="text-sm">{student.avgStress.toFixed(1)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(student.trend)}
                          <span className="text-sm capitalize">{student.trend}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{student.streak} days</Badge>
                      </TableCell>
                      <TableCell>
                        {student.hasAlert ? (
                          <Badge variant="destructive" className="gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Alert
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-emerald-600">
                            OK
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedStudent(student)}
                          data-testid={`button-view-student-${student.id}`}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex h-48 flex-col items-center justify-center text-center">
              <Users className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">No students found</p>
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? "Try adjusting your search terms"
                  : "Students will appear here when they sign up"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Detail Dialog */}
      <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedStudent && (
                <>
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={selectedStudent.profileImageUrl || ""}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {selectedStudent.firstName?.[0]}
                      {selectedStudent.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    {selectedStudent.firstName} {selectedStudent.lastName}
                    <div className="text-sm font-normal text-muted-foreground">
                      {selectedStudent.email}
                    </div>
                  </div>
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              Student wellness overview and mood history
            </DialogDescription>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="rounded-lg bg-accent/50 p-4 text-center">
                  <div className="text-2xl font-bold">{selectedStudent.avgMood.toFixed(1)}</div>
                  <div className="text-xs text-muted-foreground">Avg. Mood</div>
                </div>
                <div className="rounded-lg bg-accent/50 p-4 text-center">
                  <div className="text-2xl font-bold">{selectedStudent.avgStress.toFixed(1)}</div>
                  <div className="text-xs text-muted-foreground">Avg. Stress</div>
                </div>
                <div className="rounded-lg bg-accent/50 p-4 text-center">
                  <div className="text-2xl font-bold">{selectedStudent.streak}</div>
                  <div className="text-xs text-muted-foreground">Day Streak</div>
                </div>
                <div className="rounded-lg bg-accent/50 p-4 text-center">
                  <div className="text-2xl font-bold">{selectedStudent.moodEntries?.length || 0}</div>
                  <div className="text-xs text-muted-foreground">Total Entries</div>
                </div>
              </div>

              {/* Chart */}
              {studentChartData && studentChartData.length > 0 && (
                <div>
                  <h4 className="mb-4 font-semibold">Recent Mood & Stress Trends</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={studentChartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                      <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="mood"
                        name="Mood"
                        stroke="hsl(var(--chart-1))"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="stress"
                        name="Stress"
                        stroke="hsl(var(--chart-2))"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Recent Entries */}
              {selectedStudent.moodEntries && selectedStudent.moodEntries.length > 0 && (
                <div>
                  <h4 className="mb-4 font-semibold">Recent Entries</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedStudent.moodEntries.slice(0, 5).map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-sm font-medium">
                            {format(new Date(entry.createdAt), "MMM d, h:mm a")}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            {getMoodEmoji(entry.moodLevel)}
                            <span className="text-sm">{getMoodLabel(entry.moodLevel)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            {getStressIcon(entry.stressLevel)}
                            <span className="text-sm">{getStressLabel(entry.stressLevel)}</span>
                          </div>
                          {entry.aiSentiment && (
                            <Badge variant="secondary" className="text-xs">
                              {entry.aiSentiment}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
