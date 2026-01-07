import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Alert, User } from "@shared/schema";
import {
  AlertTriangle,
  Bell,
  Check,
  Eye,
  Clock,
  CheckCircle2,
  Filter,
} from "lucide-react";
import { format } from "date-fns";

interface AlertWithUser extends Alert {
  user: User;
}

const alertTypeConfig = {
  urgent: {
    color: "bg-red-500",
    badge: "destructive" as const,
    icon: AlertTriangle,
  },
  concerning: {
    color: "bg-orange-500",
    badge: "secondary" as const,
    icon: Bell,
  },
  informational: {
    color: "bg-blue-500",
    badge: "secondary" as const,
    icon: Eye,
  },
};

export default function AdminAlerts() {
  const [activeTab, setActiveTab] = useState("unread");
  const [selectedAlert, setSelectedAlert] = useState<AlertWithUser | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: alerts, isLoading } = useQuery<AlertWithUser[]>({
    queryKey: ["/api/admin/alerts"],
  });

  const markReadMutation = useMutation({
    mutationFn: async (alertId: number) => {
      await apiRequest("PATCH", `/api/admin/alerts/${alertId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/alerts"] });
      toast({
        title: "Alert marked as read",
        description: "The alert has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update the alert.",
        variant: "destructive",
      });
    },
  });

  const resolveMutation = useMutation({
    mutationFn: async (alertId: number) => {
      await apiRequest("PATCH", `/api/admin/alerts/${alertId}/resolve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/alerts"] });
      setSelectedAlert(null);
      toast({
        title: "Alert resolved",
        description: "The alert has been marked as resolved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to resolve the alert.",
        variant: "destructive",
      });
    },
  });

  const filteredAlerts = alerts?.filter((alert) => {
    if (activeTab === "unread") return !alert.isRead;
    if (activeTab === "read") return alert.isRead && !alert.isResolved;
    if (activeTab === "resolved") return alert.isResolved;
    return true;
  });

  const unreadCount = alerts?.filter((a) => !a.isRead).length || 0;
  const urgentCount = alerts?.filter((a) => !a.isRead && a.alertType === "urgent").length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Alerts</h1>
          <p className="text-muted-foreground">
            Monitor and respond to student wellness alerts
          </p>
        </div>
        <div className="flex items-center gap-2">
          {urgentCount > 0 && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              {urgentCount} Urgent
            </Badge>
          )}
          <Badge variant="secondary" className="gap-1">
            <Bell className="h-3 w-3" />
            {unreadCount} Unread
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="unread" className="gap-2" data-testid="tab-unread">
            <Bell className="h-4 w-4" />
            Unread
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="read" data-testid="tab-read">
            <Eye className="h-4 w-4 mr-2" />
            Read
          </TabsTrigger>
          <TabsTrigger value="resolved" data-testid="tab-resolved">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Resolved
          </TabsTrigger>
          <TabsTrigger value="all" data-testid="tab-all">
            <Filter className="h-4 w-4 mr-2" />
            All
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            {activeTab === "unread" && "Unread Alerts"}
            {activeTab === "read" && "Read Alerts"}
            {activeTab === "resolved" && "Resolved Alerts"}
            {activeTab === "all" && "All Alerts"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : filteredAlerts && filteredAlerts.length > 0 ? (
            <div className="space-y-4">
              {filteredAlerts.map((alert) => {
                const config = alertTypeConfig[alert.alertType as keyof typeof alertTypeConfig] ||
                  alertTypeConfig.informational;
                const Icon = config.icon;

                return (
                  <div
                    key={alert.id}
                    className={`flex items-start gap-4 rounded-lg border p-4 transition-colors ${
                      !alert.isRead ? "bg-accent/30" : ""
                    }`}
                    data-testid={`alert-card-${alert.id}`}
                  >
                    <div
                      className={`mt-1 flex h-8 w-8 items-center justify-center rounded-full ${config.color}`}
                    >
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage
                            src={alert.user?.profileImageUrl || ""}
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {alert.user?.firstName?.[0]}
                            {alert.user?.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">
                          {alert.user?.firstName} {alert.user?.lastName}
                        </span>
                        <Badge variant={config.badge} className="capitalize">
                          {alert.alertType}
                        </Badge>
                        {alert.isResolved && (
                          <Badge variant="outline" className="text-emerald-600">
                            Resolved
                          </Badge>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {alert.reason}
                      </p>
                      <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(alert.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </span>
                        {alert.resolvedAt && (
                          <span className="flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            Resolved {format(new Date(alert.resolvedAt), "MMM d")}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!alert.isRead && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => markReadMutation.mutate(alert.id)}
                          disabled={markReadMutation.isPending}
                          data-testid={`button-mark-read-${alert.id}`}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Mark Read
                        </Button>
                      )}
                      {!alert.isResolved && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => setSelectedAlert(alert)}
                          data-testid={`button-resolve-${alert.id}`}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex h-48 flex-col items-center justify-center text-center">
              <CheckCircle2 className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">No alerts in this category</p>
              <p className="text-sm text-muted-foreground">
                {activeTab === "unread"
                  ? "All caught up! No unread alerts."
                  : "Alerts will appear here when available."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resolve Dialog */}
      <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Alert</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark this alert as resolved?
            </DialogDescription>
          </DialogHeader>
          {selectedAlert && (
            <div className="rounded-lg bg-accent/30 p-4">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={selectedAlert.user?.profileImageUrl || ""}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {selectedAlert.user?.firstName?.[0]}
                    {selectedAlert.user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">
                  {selectedAlert.user?.firstName} {selectedAlert.user?.lastName}
                </span>
                <Badge
                  variant={
                    alertTypeConfig[selectedAlert.alertType as keyof typeof alertTypeConfig]?.badge ||
                    "secondary"
                  }
                  className="capitalize"
                >
                  {selectedAlert.alertType}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {selectedAlert.reason}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedAlert(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => selectedAlert && resolveMutation.mutate(selectedAlert.id)}
              disabled={resolveMutation.isPending}
            >
              {resolveMutation.isPending ? "Resolving..." : "Confirm Resolve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
