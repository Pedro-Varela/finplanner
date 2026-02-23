import type { CategoryId, UserId } from "./id";

type Brand<T, B extends string> = T & { readonly __brand: B };
export type MerchantRuleId = Brand<string, "MerchantRuleId">;

export type MatchType = "equals" | "contains" | "regex";

export interface MerchantRule {
  id: MerchantRuleId;
  userId: UserId;
  pattern: string;
  matchType: MatchType;
  categoryId: CategoryId | null;
  priority: number;
  createdAt: string;
}

export interface CreateMerchantRuleInput {
  pattern: string;
  matchType: MatchType;
  categoryId: CategoryId | null;
  priority?: number;
}
