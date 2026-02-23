import type { UserId } from "./id";

export type InsightId = string & { readonly __brand: "InsightId" };

export type InsightType = "warning" | "suggestion" | "info";
export type InsightStatus = "active" | "resolved";

export interface Insight {
  id: InsightId;
  userId: UserId;
  title: string;
  description: string;
  type: InsightType;
  status: InsightStatus;
  createdAt: string;
  resolvedAt: string | null;
}

export interface CreateInsightInput {
  title: string;
  description: string;
  type: InsightType;
}

export interface UpdateInsightInput {
  status?: InsightStatus;
  resolvedAt?: string | null;
}
