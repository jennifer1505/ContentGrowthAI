import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, Mail, FileText, Users, Briefcase, Settings } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { Campaign } from "@shared/schema";

export default function Generate() {
  const [topic, setTopic] = useState("");
  const [generatedCampaign, setGeneratedCampaign] = useState<Campaign | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateMutation = useMutation({
    mutationFn: async (topic: string) => {
      const response = await apiRequest<Campaign>("POST", "/api/campaigns/generate", { topic });
      return response;
    },
    onSuccess: (data) => {
      setGeneratedCampaign(data);
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["/api/metrics"] });
      toast({
        title: "Content Generated!",
        description: "Your blog post and newsletters are ready.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate content. Please try again.",
        variant: "destructive",
      });
    },
  });

  const distributeMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      await apiRequest("POST", `/api/campaigns/${campaignId}/distribute`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      toast({
        title: "Campaign Distributed!",
        description: "Newsletters have been sent via HubSpot CRM.",
      });
      setGeneratedCampaign(null);
      setTopic("");
    },
    onError: (error: Error) => {
      toast({
        title: "Distribution Failed",
        description: error.message || "Failed to distribute campaign.",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!topic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic for your content.",
        variant: "destructive",
      });
      return;
    }
    generateMutation.mutate(topic);
  };

  const personaIcons = {
    founders: Briefcase,
    creatives: Sparkles,
    operations: Settings,
  };

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight" data-testid="text-page-title">
          Generate Content
        </h1>
        <p className="text-muted-foreground mt-1">
          AI-powered blog and newsletter generation for NovaMind
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Content Generation
          </CardTitle>
          <CardDescription>
            Enter a topic to generate a blog post and three personalized newsletters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topic">Topic</Label>
            <Textarea
              id="topic"
              placeholder="e.g., AI in creative automation, Workflow optimization for agencies, Time-saving tools for creative teams..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="min-h-24 resize-none"
              disabled={generateMutation.isPending}
              data-testid="input-topic"
            />
            <p className="text-xs text-muted-foreground">
              Be specific about your topic to get the best results
            </p>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={generateMutation.isPending || !topic.trim()}
            className="w-full"
            data-testid="button-generate"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating with AI...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Content
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {generatedCampaign && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Blog Post
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2" data-testid="text-blog-title">
                  {generatedCampaign.blogTitle}
                </h3>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed" data-testid="text-blog-content">
                    {generatedCampaign.blogContent}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { persona: "founders", content: generatedCampaign.newsletterFounders, title: "Founders & Decision-Makers" },
              { persona: "creatives", content: generatedCampaign.newsletterCreatives, title: "Creative Professionals" },
              { persona: "operations", content: generatedCampaign.newsletterOperations, title: "Operations Managers" },
            ].map(({ persona, content, title }) => {
              const Icon = personaIcons[persona as keyof typeof personaIcons];
              return (
                <Card key={persona} data-testid={`card-newsletter-${persona}`}>
                  <CardHeader className="space-y-0 pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Icon className="h-4 w-4 text-primary" />
                      {title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm leading-relaxed whitespace-pre-wrap" data-testid={`text-newsletter-${persona}`}>
                      {content}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Ready to distribute?</p>
                    <p className="text-sm text-muted-foreground">
                      Send personalized newsletters to your HubSpot contacts
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => distributeMutation.mutate(generatedCampaign.id)}
                  disabled={distributeMutation.isPending}
                  data-testid="button-distribute"
                >
                  {distributeMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Distributing...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Distribute Campaign
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
