import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, Target, Activity } from "lucide-react";
import type { DashboardMetrics, CampaignWithPerformance } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: metrics, isLoading: metricsLoading } = useQuery<DashboardMetrics>({
    queryKey: ["/api/metrics"],
  });

  const { data: recentCampaigns, isLoading: campaignsLoading } = useQuery<CampaignWithPerformance[]>({
    queryKey: ["/api/campaigns/recent"],
  });

  const metricCards = [
    {
      title: "Total Campaigns",
      value: metrics?.totalCampaigns ?? 0,
      icon: Target,
      description: "All-time campaigns",
    },
    {
      title: "Avg Open Rate",
      value: `${metrics?.avgOpenRate ?? 0}%`,
      icon: TrendingUp,
      description: "Across all personas",
    },
    {
      title: "Top Persona",
      value: metrics?.topPersona ?? "—",
      icon: Users,
      description: "Highest engagement",
    },
    {
      title: "Recent Activity",
      value: metrics?.recentActivity ?? "—",
      icon: Activity,
      description: "Last campaign sent",
    },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight" data-testid="text-page-title">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Overview of your AI-powered marketing campaigns
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((metric, index) => (
          <Card key={index} data-testid={`card-metric-${index}`}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {metricsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-semibold" data-testid={`text-metric-value-${index}`}>
                  {metric.value}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Campaigns</CardTitle>
          <CardDescription>Your latest marketing campaigns and their performance</CardDescription>
        </CardHeader>
        <CardContent>
          {campaignsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentCampaigns && recentCampaigns.length > 0 ? (
            <div className="space-y-4">
              {recentCampaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="flex items-start gap-4 p-4 rounded-lg border hover-elevate"
                  data-testid={`card-campaign-${campaign.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate" data-testid={`text-campaign-title-${campaign.id}`}>
                      {campaign.blogTitle}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(campaign.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                  {campaign.performance && campaign.performance.length > 0 && (
                    <div className="flex gap-4 items-center">
                      {campaign.performance.map((perf) => (
                        <div key={perf.id} className="text-center">
                          <div className="text-sm font-medium">{perf.openRate}%</div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {perf.persona}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No campaigns yet. Create your first campaign to get started!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
