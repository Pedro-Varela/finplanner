import { type CategoryIcon, DEFAULT_CATEGORY_ICON } from "@/core/entities";

export type CategoryFamily =
  | "housing"
  | "food"
  | "mobility"
  | "health"
  | "work"
  | "education"
  | "taxes"
  | "investments"
  | "utilities"
  | "lifestyle"
  | "shopping"
  | "travel"
  | "entertainment"
  | "technology"
  | "pets"
  | "general";

export const CATEGORY_FAMILY_LABELS: Record<CategoryFamily, string> = {
  housing: "Casa",
  food: "Alimentação",
  mobility: "Mobilidade",
  health: "Saúde",
  work: "Trabalho",
  education: "Educação",
  taxes: "Tributos",
  investments: "Investimentos",
  utilities: "Contas",
  lifestyle: "Estilo de vida",
  shopping: "Compras",
  travel: "Viagens",
  entertainment: "Lazer",
  technology: "Tecnologia",
  pets: "Pets",
  general: "Geral",
};

const ICON_FAMILY_MAP: Record<CategoryIcon, CategoryFamily> = {
  tag: "general",
  utensils: "food",
  car: "mobility",
  bus: "mobility",
  home: "housing",
  "shopping-bag": "shopping",
  "heart-pulse": "health",
  briefcase: "work",
  "graduation-cap": "education",
  landmark: "taxes",
  "piggy-bank": "investments",
  "chart-candlestick": "investments",
  receipt: "utilities",
  dumbbell: "health",
  plane: "travel",
  gift: "lifestyle",
  "gamepad-2": "entertainment",
  popcorn: "entertainment",
  shirt: "shopping",
  smartphone: "technology",
  wifi: "utilities",
  "paw-print": "pets",
};

interface CategorySuggestionRule {
  icon: CategoryIcon;
  family: CategoryFamily;
  keywords: string[];
}

const CATEGORY_ICON_SUGGESTION_RULES: CategorySuggestionRule[] = [
  { icon: "home", family: "housing", keywords: ["aluguel", "moradia", "condominio", "casa"] },
  {
    icon: "utensils",
    family: "food",
    keywords: ["mercado", "supermercado", "alimentacao", "alimentação", "restaurante", "ifood"],
  },
  {
    icon: "car",
    family: "mobility",
    keywords: ["transporte", "combustivel", "combustível", "gasolina", "uber", "99"],
  },
  {
    icon: "heart-pulse",
    family: "health",
    keywords: ["saude", "saúde", "farmacia", "farmácia", "medico", "médico", "plano"],
  },
  {
    icon: "briefcase",
    family: "work",
    keywords: ["trabalho", "freela", "projeto", "empresa", "cliente"],
  },
  {
    icon: "graduation-cap",
    family: "education",
    keywords: ["curso", "faculdade", "escola", "educacao", "educação"],
  },
  {
    icon: "landmark",
    family: "taxes",
    keywords: ["imposto", "iptu", "ipva", "tributo", "taxa"],
  },
  {
    icon: "chart-candlestick",
    family: "investments",
    keywords: [
      "invest",
      "aporte",
      "reserva",
      "previdencia",
      "previdência",
      "tesouro",
      "cdb",
      "fii",
      "acoes",
      "ações",
    ],
  },
  {
    icon: "receipt",
    family: "utilities",
    keywords: ["conta", "fatura", "energia", "luz", "agua", "água", "internet", "telefone"],
  },
  {
    icon: "dumbbell",
    family: "health",
    keywords: ["academia", "pilates", "crossfit", "esporte", "fitness"],
  },
  {
    icon: "plane",
    family: "travel",
    keywords: ["viagem", "hotel", "aereo", "aéreo", "passagem"],
  },
  {
    icon: "gift",
    family: "lifestyle",
    keywords: ["presente", "aniversario", "aniversário", "doacao", "doação"],
  },
  {
    icon: "gamepad-2",
    family: "entertainment",
    keywords: ["jogo", "game", "steam", "playstation", "xbox"],
  },
  {
    icon: "popcorn",
    family: "entertainment",
    keywords: ["lazer", "cinema", "netflix", "spotify", "entretenimento"],
  },
  {
    icon: "shirt",
    family: "shopping",
    keywords: ["roupa", "vestuario", "vestuário", "moda"],
  },
  {
    icon: "smartphone",
    family: "technology",
    keywords: ["celular", "app", "software", "tecnologia", "eletronico", "eletrônico"],
  },
  {
    icon: "wifi",
    family: "utilities",
    keywords: ["wifi", "banda larga", "fibra", "provedor"],
  },
  { icon: "paw-print", family: "pets", keywords: ["pet", "veterinario", "veterinário", "racao"] },
  {
    icon: "shopping-bag",
    family: "shopping",
    keywords: ["compra", "shopping", "ecommerce", "amazon", "mercado livre"],
  },
];

export interface CategoryIconSuggestion {
  icon: CategoryIcon;
  family: CategoryFamily;
  keyword: string;
  confidence: "high" | "medium";
}

function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function resolveCategoryFamily(input: {
  name: string;
  icon?: string | null;
}): CategoryFamily {
  const icon = (input.icon ?? DEFAULT_CATEGORY_ICON) as CategoryIcon;
  if (icon in ICON_FAMILY_MAP) {
    return ICON_FAMILY_MAP[icon];
  }

  const suggestion = suggestCategoryIconFromName(input.name);
  return suggestion?.family ?? "general";
}

export function suggestCategoryIconFromName(name: string): CategoryIconSuggestion | null {
  const normalizedName = normalizeText(name);
  if (normalizedName.length < 3) return null;

  for (const rule of CATEGORY_ICON_SUGGESTION_RULES) {
    const keyword = rule.keywords.find((item) => normalizedName.includes(normalizeText(item)));
    if (!keyword) continue;

    const confidence: "high" | "medium" = normalizedName.startsWith(normalizeText(keyword))
      ? "high"
      : "medium";

    return {
      icon: rule.icon,
      family: rule.family,
      keyword,
      confidence,
    };
  }

  return null;
}
