export type FinancialBucket = "essential" | "leisure" | "investment";

export const ESSENTIAL_CATEGORY_KEYWORDS = [
  "aluguel",
  "renda",
  "moradia",
  "condominio",
  "água",
  "agua",
  "luz",
  "energia",
  "internet",
  "telefone",
  "mercado",
  "supermercado",
  "farmacia",
  "farmácia",
  "saude",
  "saúde",
  "transporte",
  "combustivel",
  "combustível",
  "gasolina",
  "seguro",
  "escola",
  "educacao",
  "educação",
  "imposto",
] as const;

export const INVESTMENT_CATEGORY_KEYWORDS = [
  "invest",
  "reserva",
  "aposentadoria",
  "previdencia",
  "previdência",
  "tesouro",
  "cdb",
  "fii",
  "acoes",
  "ações",
  "cript",
] as const;

export function normalizeCategoryName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function resolveCategoryBucket(categoryName: string): FinancialBucket {
  const name = normalizeCategoryName(categoryName);

  if (INVESTMENT_CATEGORY_KEYWORDS.some((keyword) => name.includes(keyword))) {
    return "investment";
  }

  if (ESSENTIAL_CATEGORY_KEYWORDS.some((keyword) => name.includes(keyword))) {
    return "essential";
  }

  return "leisure";
}
