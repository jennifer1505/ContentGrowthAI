import type { 
  Campaign, InsertCampaign,
  Performance, InsertPerformance,
  Insight, InsertInsight,
  CampaignWithPerformance,
  DashboardMetrics,
  PersonaPerformance,
  PersonaType
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Campaign operations
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  getCampaign(id: string): Promise<Campaign | undefined>;
  getCampaigns(): Promise<Campaign[]>;
  getRecentCampaigns(limit: number): Promise<Campaign[]>;
  updateCampaignStatus(id: string, status: string): Promise<void>;
  getCampaignsWithPerformance(): Promise<CampaignWithPerformance[]>;
  
  // Performance operations
  createPerformance(performance: InsertPerformance): Promise<Performance>;
  getPerformanceByCampaign(campaignId: string): Promise<Performance[]>;
  
  // Insight operations
  createInsight(insight: InsertInsight): Promise<Insight>;
  getInsightByCampaign(campaignId: string): Promise<Insight | undefined>;
  
  // Analytics
  getDashboardMetrics(): Promise<DashboardMetrics>;
  getPersonaPerformance(): Promise<PersonaPerformance[]>;
}

export class MemStorage implements IStorage {
  private campaigns: Map<string, Campaign>;
  private performances: Map<string, Performance>;
  private insights: Map<string, Insight>;

  constructor() {
    this.campaigns = new Map();
    this.performances = new Map();
    this.insights = new Map();
  }

  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const id = randomUUID();
    const campaign: Campaign = {
      ...insertCampaign,
      id,
      createdAt: new Date(),
      status: insertCampaign.status || "draft",
    };
    this.campaigns.set(id, campaign);
    return campaign;
  }

  async getCampaign(id: string): Promise<Campaign | undefined> {
    return this.campaigns.get(id);
  }

  async getCampaigns(): Promise<Campaign[]> {
    return Array.from(this.campaigns.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getRecentCampaigns(limit: number): Promise<Campaign[]> {
    const campaigns = await this.getCampaigns();
    return campaigns.slice(0, limit);
  }

  async updateCampaignStatus(id: string, status: string): Promise<void> {
    const campaign = this.campaigns.get(id);
    if (campaign) {
      campaign.status = status;
      this.campaigns.set(id, campaign);
    }
  }

  async getCampaignsWithPerformance(): Promise<CampaignWithPerformance[]> {
    const campaigns = await this.getCampaigns();
    const campaignsWithPerf: CampaignWithPerformance[] = [];

    for (const campaign of campaigns) {
      const performance = await this.getPerformanceByCampaign(campaign.id);
      const insight = await this.getInsightByCampaign(campaign.id);
      
      campaignsWithPerf.push({
        ...campaign,
        performance,
        insight,
      });
    }

    return campaignsWithPerf;
  }

  async createPerformance(insertPerformance: InsertPerformance): Promise<Performance> {
    const id = randomUUID();
    const performance: Performance = {
      ...insertPerformance,
      id,
      createdAt: new Date(),
    };
    this.performances.set(id, performance);
    return performance;
  }

  async getPerformanceByCampaign(campaignId: string): Promise<Performance[]> {
    return Array.from(this.performances.values()).filter(
      (p) => p.campaignId === campaignId
    );
  }

  async createInsight(insertInsight: InsertInsight): Promise<Insight> {
    const id = randomUUID();
    const insight: Insight = {
      ...insertInsight,
      id,
      createdAt: new Date(),
    };
    this.insights.set(id, insight);
    return insight;
  }

  async getInsightByCampaign(campaignId: string): Promise<Insight | undefined> {
    return Array.from(this.insights.values()).find(
      (i) => i.campaignId === campaignId
    );
  }

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const campaigns = await this.getCampaigns();
    const totalCampaigns = campaigns.length;

    if (totalCampaigns === 0) {
      return {
        totalCampaigns: 0,
        avgOpenRate: 0,
        topPersona: "—",
        recentActivity: "No campaigns yet",
      };
    }

    // Calculate average open rate across all performances
    const allPerformances = Array.from(this.performances.values());
    const avgOpenRate = allPerformances.length > 0
      ? Math.round(
          allPerformances.reduce((sum, p) => sum + p.openRate, 0) / allPerformances.length
        )
      : 0;

    // Find top performing persona
    const personaStats = new Map<string, { total: number; count: number }>();
    allPerformances.forEach((p) => {
      const stats = personaStats.get(p.persona) || { total: 0, count: 0 };
      stats.total += p.openRate;
      stats.count += 1;
      personaStats.set(p.persona, stats);
    });

    let topPersona = "—";
    let topAvg = 0;
    personaStats.forEach((stats, persona) => {
      const avg = stats.total / stats.count;
      if (avg > topAvg) {
        topAvg = avg;
        topPersona = persona.charAt(0).toUpperCase() + persona.slice(1);
      }
    });

    // Get most recent campaign date
    const mostRecent = campaigns[0];
    const recentActivity = mostRecent
      ? new Date(mostRecent.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })
      : "—";

    return {
      totalCampaigns,
      avgOpenRate,
      topPersona,
      recentActivity,
    };
  }

  async getPersonaPerformance(): Promise<PersonaPerformance[]> {
    const allPerformances = Array.from(this.performances.values());
    
    if (allPerformances.length === 0) {
      return [];
    }

    const personaStats = new Map<string, {
      openRates: number[];
      clickRates: number[];
      unsubscribeRates: number[];
      campaigns: Set<string>;
    }>();

    allPerformances.forEach((p) => {
      const stats = personaStats.get(p.persona) || {
        openRates: [],
        clickRates: [],
        unsubscribeRates: [],
        campaigns: new Set(),
      };
      stats.openRates.push(p.openRate);
      stats.clickRates.push(p.clickRate);
      stats.unsubscribeRates.push(p.unsubscribeRate);
      stats.campaigns.add(p.campaignId);
      personaStats.set(p.persona, stats);
    });

    const results: PersonaPerformance[] = [];
    personaStats.forEach((stats, persona) => {
      results.push({
        persona: persona as PersonaType,
        avgOpenRate: Math.round(
          stats.openRates.reduce((sum, r) => sum + r, 0) / stats.openRates.length
        ),
        avgClickRate: Math.round(
          stats.clickRates.reduce((sum, r) => sum + r, 0) / stats.clickRates.length
        ),
        avgUnsubscribeRate: Math.round(
          stats.unsubscribeRates.reduce((sum, r) => sum + r, 0) / stats.unsubscribeRates.length
        ),
        campaignCount: stats.campaigns.size,
      });
    });

    return results;
  }
}

export const storage = new MemStorage();
