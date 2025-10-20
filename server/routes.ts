import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateMarketingContent, generatePerformanceInsight } from "./openai";
import { distributeNewsletters } from "./hubspot";
import { contentGenerationSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Dashboard metrics endpoint
  app.get("/api/metrics", async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    } catch (error: any) {
      console.error("Error fetching metrics:", error);
      res.status(500).json({ error: "Failed to fetch metrics" });
    }
  });

  // Get recent campaigns for dashboard
  app.get("/api/campaigns/recent", async (req, res) => {
    try {
      const recentCampaigns = await storage.getRecentCampaigns(5);
      const campaignsWithPerf = await Promise.all(
        recentCampaigns.map(async (campaign) => {
          const performance = await storage.getPerformanceByCampaign(campaign.id);
          const insight = await storage.getInsightByCampaign(campaign.id);
          return { ...campaign, performance, insight };
        })
      );
      res.json(campaignsWithPerf);
    } catch (error: any) {
      console.error("Error fetching recent campaigns:", error);
      res.status(500).json({ error: "Failed to fetch recent campaigns" });
    }
  });

  // Get all campaigns with performance data
  app.get("/api/campaigns", async (req, res) => {
    try {
      const campaigns = await storage.getCampaignsWithPerformance();
      res.json(campaigns);
    } catch (error: any) {
      console.error("Error fetching campaigns:", error);
      res.status(500).json({ error: "Failed to fetch campaigns" });
    }
  });

  // Generate new campaign content
  app.post("/api/campaigns/generate", async (req, res) => {
    try {
      // Validate request
      const { topic } = contentGenerationSchema.parse(req.body);

      // Generate content using OpenAI (with automatic fallback to simulation if API fails)
      const generatedContent = await generateMarketingContent(topic);

      // Store campaign
      const campaign = await storage.createCampaign({
        topic,
        blogTitle: generatedContent.blogTitle,
        blogContent: generatedContent.blogContent,
        blogOutline: generatedContent.blogOutline,
        newsletterFounders: generatedContent.newsletterFounders,
        newsletterCreatives: generatedContent.newsletterCreatives,
        newsletterOperations: generatedContent.newsletterOperations,
        status: "draft",
      });

      res.json(campaign);
    } catch (error: any) {
      console.error("Error generating campaign:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors[0].message });
      } else {
        res.status(500).json({ error: error.message || "Failed to generate content" });
      }
    }
  });

  // Distribute campaign via HubSpot
  app.post("/api/campaigns/:id/distribute", async (req, res) => {
    try {
      const { id } = req.params;
      const campaign = await storage.getCampaign(id);

      if (!campaign) {
        return res.status(404).json({ error: "Campaign not found" });
      }

      // Distribute via HubSpot
      const distributionResults = await distributeNewsletters(
        campaign.id,
        campaign.blogTitle,
        {
          founders: campaign.newsletterFounders,
          creatives: campaign.newsletterCreatives,
          operations: campaign.newsletterOperations,
        }
      );

      // Simulate performance data (in production, this would come from actual email metrics)
      const performanceData: Array<{ persona: string; openRate: number; clickRate: number }> = [];

      for (const result of distributionResults) {
        // Simulate realistic performance metrics with some variance
        const baseOpenRate = 35 + Math.floor(Math.random() * 30); // 35-65%
        const baseClickRate = 8 + Math.floor(Math.random() * 12); // 8-20%
        const unsubscribeRate = Math.floor(Math.random() * 3); // 0-2%

        const performance = await storage.createPerformance({
          campaignId: campaign.id,
          persona: result.persona,
          recipientCount: result.recipientCount,
          openRate: baseOpenRate,
          clickRate: baseClickRate,
          unsubscribeRate,
        });

        performanceData.push({
          persona: result.persona,
          openRate: performance.openRate,
          clickRate: performance.clickRate,
        });
      }

      // Generate AI insights based on performance
      const insights = await generatePerformanceInsight(
        campaign.blogTitle,
        performanceData
      );

      await storage.createInsight({
        campaignId: campaign.id,
        summary: insights.summary,
        recommendations: insights.recommendations,
        topPerformingPersona: insights.topPerformingPersona,
      });

      // Update campaign status
      await storage.updateCampaignStatus(campaign.id, "completed");

      res.json({ success: true, distributionResults });
    } catch (error: any) {
      console.error("Error distributing campaign:", error);
      res.status(500).json({ error: "Failed to distribute campaign" });
    }
  });

  // Analytics: persona performance
  app.get("/api/analytics/persona-performance", async (req, res) => {
    try {
      const personaPerformance = await storage.getPersonaPerformance();
      res.json(personaPerformance);
    } catch (error: any) {
      console.error("Error fetching persona performance:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
