import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Target, TrendingUp, Eye } from "lucide-react";
import type { CampaignWithPerformance } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Campaigns() {
  const { data: campaigns, isLoading } = useQuery<CampaignWithPerformance[]>({
    queryKey: ["/api/campaigns"],
  });

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight" data-testid="text-page-title">
          Campaign History
        </h1>
        <p className="text-muted-foreground mt-1">
          View all your marketing campaigns and performance data
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : campaigns && campaigns.length > 0 ? (
        <div className="space-y-4">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} data-testid={`card-campaign-${campaign.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="flex items-center gap-2 flex-wrap">
                      <span className="truncate" data-testid={`text-campaign-title-${campaign.id}`}>
                        {campaign.blogTitle}
                      </span>
                      <Badge variant={campaign.status === "completed" ? "default" : "secondary"}>
                        {campaign.status}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-2 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(campaign.createdAt).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        Topic: {campaign.topic}
                      </span>
                    </CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" data-testid={`button-view-${campaign.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{campaign.blogTitle}</DialogTitle>
                        <DialogDescription>Campaign details and content</DialogDescription>
                      </DialogHeader>
                      <Tabs defaultValue="blog" className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                          <TabsTrigger value="blog">Blog Post</TabsTrigger>
                          <TabsTrigger value="founders">Founders</TabsTrigger>
                          <TabsTrigger value="creatives">Creatives</TabsTrigger>
                          <TabsTrigger value="operations">Operations</TabsTrigger>
                        </TabsList>
                        <TabsContent value="blog" className="space-y-4 mt-4">
                          <div className="prose prose-sm dark:prose-invert max-w-none">
                            <div className="whitespace-pre-wrap text-sm leading-relaxed">
                              {campaign.blogContent}
                            </div>
                          </div>
                        </TabsContent>
                        <TabsContent value="founders" className="space-y-4 mt-4">
                          <div className="text-sm leading-relaxed whitespace-pre-wrap">
                            {campaign.newsletterFounders}
                          </div>
                        </TabsContent>
                        <TabsContent value="creatives" className="space-y-4 mt-4">
                          <div className="text-sm leading-relaxed whitespace-pre-wrap">
                            {campaign.newsletterCreatives}
                          </div>
                        </TabsContent>
                        <TabsContent value="operations" className="space-y-4 mt-4">
                          <div className="text-sm leading-relaxed whitespace-pre-wrap">
                            {campaign.newsletterOperations}
                          </div>
                        </TabsContent>
                      </Tabs>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              {campaign.performance && campaign.performance.length > 0 && (
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {campaign.performance.map((perf) => (
                      <div
                        key={perf.id}
                        className="flex items-center justify-between p-3 rounded-lg border"
                        data-testid={`performance-${campaign.id}-${perf.persona}`}
                      >
                        <div>
                          <p className="text-sm font-medium capitalize">{perf.persona}</p>
                          <p className="text-xs text-muted-foreground">{perf.recipientCount} recipients</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-sm font-semibold">
                            <TrendingUp className="h-3 w-3 text-chart-2" />
                            {perf.openRate}%
                          </div>
                          <p className="text-xs text-muted-foreground">open rate</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {campaign.insight && (
                    <div className="mt-4 p-4 rounded-lg bg-muted/50 space-y-2">
                      <p className="text-sm font-medium">AI Insights</p>
                      <p className="text-sm text-muted-foreground">{campaign.insight.summary}</p>
                      {campaign.insight.recommendations && (
                        <p className="text-sm text-primary">{campaign.insight.recommendations}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p className="text-muted-foreground">No campaigns yet. Create your first campaign to get started!</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
