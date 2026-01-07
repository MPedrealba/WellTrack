import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";

// Pages
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import StudentDashboard from "@/pages/student-dashboard";
import CheckIn from "@/pages/check-in";
import MoodHistory from "@/pages/mood-history";
import Resources from "@/pages/resources";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminAlerts from "@/pages/admin-alerts";
import AdminStudents from "@/pages/admin-students";

// Sidebars
import { StudentSidebar } from "@/components/student-sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-muted-foreground">Loading WellTrack...</p>
      </div>
    </div>
  );
}

function StudentLayout({ children }: { children: React.ReactNode }) {
  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  } as React.CSSProperties;

  return (
    <SidebarProvider style={sidebarStyle}>
      <div className="flex min-h-screen w-full">
        <StudentSidebar />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <div className="mb-4 md:hidden">
              <SidebarTrigger data-testid="button-mobile-menu" />
            </div>
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

function AdminLayout({ children }: { children: React.ReactNode }) {
  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  } as React.CSSProperties;

  return (
    <SidebarProvider style={sidebarStyle}>
      <div className="flex min-h-screen w-full">
        <AdminSidebar />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <div className="mb-4 md:hidden">
              <SidebarTrigger data-testid="button-admin-mobile-menu" />
            </div>
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

function StudentRoutes() {
  return (
    <StudentLayout>
      <Switch>
        <Route path="/" component={StudentDashboard} />
        <Route path="/check-in" component={CheckIn} />
        <Route path="/history" component={MoodHistory} />
        <Route path="/resources" component={Resources} />
        <Route component={NotFound} />
      </Switch>
    </StudentLayout>
  );
}

function AdminRoutes() {
  return (
    <AdminLayout>
      <Switch>
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/alerts" component={AdminAlerts} />
        <Route path="/admin/students" component={AdminStudents} />
        <Route path="/admin/analytics" component={AdminDashboard} />
        <Route path="/admin/resources" component={Resources} />
        <Route component={NotFound} />
      </Switch>
    </AdminLayout>
  );
}

function Router() {
  const { isAuthenticated, isLoading, isAdmin, isStudent } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/login" component={Login} />
        <Route component={Landing} />
      </Switch>
    );
  }

  // Admin users: redirect from student routes to admin dashboard
  if (isAdmin) {
    // If admin tries to access student-only routes, redirect to admin dashboard
    if (!location.startsWith("/admin")) {
      return <Redirect to="/admin" />;
    }
    return <AdminRoutes />;
  }

  // Student users: redirect from admin routes to student dashboard
  if (isStudent) {
    // If student tries to access admin routes, redirect to student dashboard
    if (location.startsWith("/admin")) {
      return <Redirect to="/" />;
    }
    return <StudentRoutes />;
  }

  // Default: show student routes
  return <StudentRoutes />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
