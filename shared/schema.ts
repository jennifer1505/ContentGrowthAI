import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Persona types for newsletter segmentation
export const personaTypes = ["founders", "creatives", "operations"] as const;
export type PersonaType = typeof personaTypes[number];

// Campaign table - stores each marketing campaign
export const campaigns = pgTable("campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  topic: text("topic").notNull(),
  blogTitle: text("blog_title").notNull(),
  blogContent: text("blog_content").notNull(),
  blogOutline: text("blog_outline").notNull(),
  newsletterFounders: text("newsletter_founders").notNull(),
  newsletterCreatives: text("newsletter_creatives").notNull(),
  newsletterOperations: text("newsletter_operations").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  status: text("status").notNull().default("draft"), // draft, sent, completed
});

// Performance metrics for each campaign and persona
export const performance = pgTable("performance", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").notNull(),
  persona: text("persona").notNull(), // founders, creatives, operations
  recipientCount: integer("recipient_count").notNull().default(0),
  openRate: integer("open_rate").notNull().default(0), // stored as percentage (0-100)
  clickRate: integer("click_rate").notNull().default(0), // stored as percentage (0-100)
  unsubscribeRate: integer("unsubscribe_rate").notNull().default(0), // stored as percentage (0-100)
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// AI insights generated from performance data
export const insights = pgTable("insights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").notNull(),
  summary: text("summary").notNull(),
  recommendations: text("recommendations").notNull(),
  topPerformingPersona: text("top_performing_persona").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Zod schemas for validation
export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  createdAt: true,
});

export const insertPerformanceSchema = createInsertSchema(performance).omit({
  id: true,
  createdAt: true,
});

export const insertInsightSchema = createInsertSchema(insights).omit({
  id: true,
  createdAt: true,
});

// Content generation request schema
export const contentGenerationSchema = z.object({
  topic: z.string().min(5, "Topic must be at least 5 characters").max(500, "Topic too long"),
});

// Types
export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Performance = typeof performance.$inferSelect;
export type InsertPerformance = z.infer<typeof insertPerformanceSchema>;
export type Insight = typeof insights.$inferSelect;
export type InsertInsight = z.infer<typeof insertInsightSchema>;
export type ContentGenerationRequest = z.infer<typeof contentGenerationSchema>;

// Campaign with performance data
export type CampaignWithPerformance = Campaign & {
  performance: Performance[];
  insight?: Insight;
};

// Aggregated metrics for dashboard
export interface DashboardMetrics {
  totalCampaigns: number;
  avgOpenRate: number;
  topPersona: string;
  recentActivity: string;
}

// Performance by persona for analytics
export interface PersonaPerformance {
  persona: PersonaType;
  avgOpenRate: number;
  avgClickRate: number;
  avgUnsubscribeRate: number;
  campaignCount: number;
}
