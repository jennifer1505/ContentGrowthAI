import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, Users, MousePointerClick, UserMinus } from "lucide-react";
import type { PersonaPerformance } from "@shared/schema";

export default function Analytics() {
  const { data: personaPerformance, isLoading } = useQuery<PersonaPerformance[]>({
    queryKey: ["/api/analytics/persona-performance"],
  });

  const chartData = personaPerformance?.map(p => ({
    name: p.persona.charAt(0).toUpperCase() + p.persona.slice(1),
    openRate: p.avgOpenRate,
    clickRate: p.avgClickRate,
    campaigns: p.campaignCount,
  })) ?? [];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight" data-testid="text-page-title">
          Analytics
        </h1>
        <p className="text-muted-foreground mt-1">
          Performance insights across personas and campaigns
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance by Persona</CardTitle>
          <CardDescription>Engagement metrics comparison across audience segments</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-80 w-full" />
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.375rem",
                  }}
                />
                <Legend />
                <Bar dataKey="openRate" fill="hsl(var(--chart-1))" name="Open Rate %" radius={[4, 4, 0, 0]} />
                <Bar dataKey="clickRate" fill="hsl(var(--chart-2))" name="Click Rate %" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-80 flex items-center justify-center text-muted-foreground">
              No data available yet
            </div>
          )}
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : personaPerformance && personaPerformance.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {personaPerformance.map((persona) => (
            <Card key={persona.persona} data-testid={`card-persona-${persona.persona}`}>
              <CardHeader>
                <CardTitle className="capitalize flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  {persona.persona}
                </CardTitle>
                <CardDescription>{persona.campaignCount} campaigns</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-chart-1" />
                    <span className="text-muted-foreground">Open Rate</span>
                  </div>
                  <span className="font-semibold" data-testid={`text-open-rate-${persona.persona}`}>
                    {persona.avgOpenRate}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <MousePointerClick className="h-4 w-4 text-chart-2" />
                    <span className="text-muted-foreground">Click Rate</span>
                  </div>
                  <span className="font-semibold" data-testid={`text-click-rate-${persona.persona}`}>
                    {persona.avgClickRate}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <UserMinus className="h-4 w-4 text-chart-4" />
                    <span className="text-muted-foreground">Unsubscribe</span>
                  </div>
                  <span className="font-semibold" data-testid={`text-unsubscribe-rate-${persona.persona}`}>
                    {persona.avgUnsubscribeRate}%
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}
