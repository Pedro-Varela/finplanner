import type { MatchType } from "@/core/entities";

export interface RuleInput {
  pattern: string;
  matchType: MatchType;
  categoryId: string | null;
  priority: number;
}

/**
 * Aplica regras de categorização a um merchant normalizado.
 * Regras são avaliadas por ordem de prioridade (ASC = maior prioridade primeiro).
 * Retorna o category_id da primeira regra que faz match, ou null.
 */
export function applyRules(merchantNormalized: string, rules: RuleInput[]): string | null {
  if (!merchantNormalized || rules.length === 0) return null;

  const sorted = [...rules].sort((a, b) => a.priority - b.priority);

  const upper = merchantNormalized.toUpperCase();

  for (const rule of sorted) {
    const pattern = rule.pattern.toUpperCase();

    let matched = false;

    switch (rule.matchType) {
      case "equals":
        matched = upper === pattern;
        break;
      case "contains":
        matched = upper.includes(pattern);
        break;
      case "regex":
        try {
          matched = new RegExp(rule.pattern, "i").test(merchantNormalized);
        } catch {
          matched = false;
        }
        break;
    }

    if (matched && rule.categoryId) {
      return rule.categoryId;
    }
  }

  return null;
}
