import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Resource } from "@shared/schema";
import {
  BookOpen,
  Brain,
  Moon,
  GraduationCap,
  Heart,
  Search,
  ExternalLink,
  Phone,
  AlertTriangle,
} from "lucide-react";

const categoryIcons: Record<string, React.ReactNode> = {
  stress: <Brain className="h-5 w-5" />,
  sleep: <Moon className="h-5 w-5" />,
  academic: <GraduationCap className="h-5 w-5" />,
  crisis: <AlertTriangle className="h-5 w-5" />,
  general: <Heart className="h-5 w-5" />,
};

const categoryColors: Record<string, string> = {
  stress: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  sleep: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
  academic: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  crisis: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  general: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
};

// Crisis hotlines - these are always displayed
const crisisResources = [
  {
    name: "National Suicide Prevention Lifeline",
    phone: "988",
    description: "24/7 free and confidential support for people in distress",
  },
  {
    name: "Crisis Text Line",
    phone: "Text HOME to 741741",
    description: "Free 24/7 support via text message",
  },
  {
    name: "SAMHSA National Helpline",
    phone: "1-800-662-4357",
    description: "Free, confidential, 24/7, 365-day-a-year treatment referral",
  },
];

export default function Resources() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const { data: resources, isLoading } = useQuery<Resource[]>({
    queryKey: ["/api/resources"],
  });

  const filteredResources = resources?.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      activeCategory === "all" || resource.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold md:text-3xl">Wellness Resources</h1>
        <p className="text-muted-foreground">
          Explore curated resources to support your mental health journey
        </p>
      </div>

      {/* Crisis Resources Banner */}
      <Card className="border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
            <Phone className="h-5 w-5" />
            Need Immediate Help?
          </CardTitle>
          <CardDescription className="text-red-600 dark:text-red-400/80">
            If you're in crisis or need immediate support, please reach out to these 24/7 resources.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {crisisResources.map((resource) => (
              <div
                key={resource.name}
                className="rounded-lg bg-white/80 p-4 dark:bg-red-950/50"
              >
                <h4 className="font-semibold text-red-700 dark:text-red-400">
                  {resource.name}
                </h4>
                <p className="mt-1 text-lg font-bold text-red-800 dark:text-red-300">
                  {resource.phone}
                </p>
                <p className="mt-1 text-xs text-red-600 dark:text-red-400/80">
                  {resource.description}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-resources"
          />
        </div>
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="flex-wrap">
            <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
            <TabsTrigger value="stress" data-testid="tab-stress">Stress</TabsTrigger>
            <TabsTrigger value="sleep" data-testid="tab-sleep">Sleep</TabsTrigger>
            <TabsTrigger value="academic" data-testid="tab-academic">Academic</TabsTrigger>
            <TabsTrigger value="general" data-testid="tab-general">General</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Resources Grid */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      ) : filteredResources && filteredResources.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredResources.map((resource) => (
            <Card key={resource.id} className="flex flex-col hover-elevate" data-testid={`card-resource-${resource.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      categoryColors[resource.category] || categoryColors.general
                    }`}
                  >
                    {categoryIcons[resource.category] || categoryIcons.general}
                  </div>
                  <Badge variant="secondary" className="text-xs capitalize">
                    {resource.category}
                  </Badge>
                </div>
                <CardTitle className="mt-3 text-lg">{resource.title}</CardTitle>
                <CardDescription>{resource.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="line-clamp-4 text-sm text-muted-foreground">
                  {resource.content}
                </p>
              </CardContent>
              {resource.externalUrl && (
                <div className="p-6 pt-0">
                  <Button variant="outline" className="w-full" asChild>
                    <a
                      href={resource.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid={`button-resource-link-${resource.id}`}
                    >
                      Learn More
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex h-64 flex-col items-center justify-center text-center">
            <BookOpen className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">No resources found</p>
            <p className="text-sm text-muted-foreground">
              {searchQuery
                ? "Try adjusting your search terms"
                : "Resources will appear here when available"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Tips Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            Quick Wellness Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-accent/50 p-4">
              <h4 className="font-semibold">Breathe Deeply</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                Try 4-7-8 breathing: inhale for 4s, hold for 7s, exhale for 8s.
              </p>
            </div>
            <div className="rounded-lg bg-accent/50 p-4">
              <h4 className="font-semibold">Stay Active</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                Even a short 10-minute walk can boost your mood and energy.
              </p>
            </div>
            <div className="rounded-lg bg-accent/50 p-4">
              <h4 className="font-semibold">Connect</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                Reach out to a friend, family member, or counselor when needed.
              </p>
            </div>
            <div className="rounded-lg bg-accent/50 p-4">
              <h4 className="font-semibold">Rest Well</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                Aim for 7-9 hours of sleep and keep a consistent schedule.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
