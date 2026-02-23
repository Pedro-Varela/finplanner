import type { MatchType } from "@/core/entities";

export interface RuleInput {
  pattern: string;
  matchType: MatchType;
  categoryId: string | null;
  priority: number;
}

export function matchesRule(
  merchantNormalized: string,
  rule: Omit<RuleInput, "categoryId" | "priority">
): boolean {
  if (!merchantNormalized) return false;

  const upper = merchantNormalized.toUpperCase();
  const pattern = rule.pattern.toUpperCase();

  switch (rule.matchType) {
    case "equals":
      return upper === pattern;
    case "contains":
      return upper.includes(pattern);
    case "regex":
      try {
        return new RegExp(rule.pattern, "i").test(merchantNormalized);
      } catch {
        return false;
      }
    default:
      return false;
  }
}

/**
 * Aplica regras de categorização a um merchant normalizado.
 * Regras são avaliadas por ordem de prioridade (ASC = maior prioridade primeiro).
 * Retorna o category_id da primeira regra que faz match, ou null.
 */
export function applyRules(merchantNormalized: string, rules: RuleInput[]): string | null {
  if (!merchantNormalized || rules.length === 0) return null;

  const sorted = [...rules].sort((a, b) => a.priority - b.priority);

  for (const rule of sorted) {
    if (matchesRule(merchantNormalized, rule) && rule.categoryId) {
      return rule.categoryId;
    }
  }

  return null;
}
