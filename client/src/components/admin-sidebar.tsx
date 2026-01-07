import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Brain,
  LayoutDashboard,
  Users,
  AlertTriangle,
  BarChart3,
  BookOpen,
  LogOut,
  Settings,
  Bell,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Alert } from "@shared/schema";

const adminMenuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/admin",
  },
  {
    title: "Students",
    icon: Users,
    path: "/admin/students",
  },
  {
    title: "Alerts",
    icon: AlertTriangle,
    path: "/admin/alerts",
    showBadge: true,
  },
  {
    title: "Analytics",
    icon: BarChart3,
    path: "/admin/analytics",
  },
  {
    title: "Resources",
    icon: BookOpen,
    path: "/admin/resources",
  },
];

export function AdminSidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  const { data: alerts } = useQuery<Alert[]>({
    queryKey: ["/api/admin/alerts"],
  });

  const unreadAlerts = alerts?.filter((a) => !a.isRead).length || 0;

  const initials = user
    ? `${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase() || "A"
    : "A";

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <Brain className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">WellTrack</h1>
            <p className="text-xs text-muted-foreground">Admin Portal</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminMenuItems.map((item) => {
                const isActive = location === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      data-testid={`nav-admin-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      <Link href={item.path}>
                        <item.icon className="h-4 w-4" />
                        <span className="flex-1">{item.title}</span>
                        {item.showBadge && unreadAlerts > 0 && (
                          <Badge variant="destructive" className="ml-auto text-xs">
                            {unreadAlerts}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Quick Info</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-3 py-2 space-y-3">
              {unreadAlerts > 0 && (
                <div className="flex items-center gap-3 rounded-lg bg-destructive/10 p-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/20">
                    <Bell className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">
                      {unreadAlerts} Unread Alert{unreadAlerts !== 1 ? "s" : ""}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Requires attention
                    </div>
                  </div>
                </div>
              )}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex items-center justify-between gap-2 mb-3">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            asChild
            data-testid="button-admin-settings"
          >
            <Link href="/admin/settings">
              <Settings className="h-5 w-5" />
            </Link>
          </Button>
        </div>
        <div className="flex items-center gap-3 rounded-lg bg-accent/50 p-3">
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={user?.profileImageUrl || ""}
              alt={user?.firstName || "Admin"}
              className="object-cover"
            />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="truncate text-sm font-medium">
              {user?.firstName} {user?.lastName}
            </div>
            <div className="truncate text-xs text-muted-foreground">
              Administrator
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={async () => {
              try {
                await fetch('/api/logout', { method: 'POST', credentials: 'include' });
                window.location.href = '/auth';
              } catch (error) {
                console.error('Logout failed:', error);
              }
            }}
            data-testid="button-admin-logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
