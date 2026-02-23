import type { CategoryId, UserId } from "./id";

export type CategoryType = "income" | "expense";
export const CATEGORY_ICON_OPTIONS = [
  "tag",
  "utensils",
  "car",
  "bus",
  "home",
  "shopping-bag",
  "heart-pulse",
  "briefcase",
  "graduation-cap",
  "landmark",
  "piggy-bank",
  "chart-candlestick",
  "receipt",
  "dumbbell",
  "plane",
  "gift",
  "gamepad-2",
  "popcorn",
  "shirt",
  "smartphone",
  "wifi",
  "paw-print",
] as const;

export type CategoryIcon = (typeof CATEGORY_ICON_OPTIONS)[number];
export const DEFAULT_CATEGORY_ICON: CategoryIcon = "tag";

const CATEGORY_ICON_SET = new Set<string>(CATEGORY_ICON_OPTIONS);

export function isCategoryIcon(value: string): value is CategoryIcon {
  return CATEGORY_ICON_SET.has(value);
}

export function normalizeCategoryIcon(value: string | null | undefined): CategoryIcon {
  if (!value) return DEFAULT_CATEGORY_ICON;
  return isCategoryIcon(value) ? value : DEFAULT_CATEGORY_ICON;
}

export interface Category {
  id: CategoryId;
  userId: UserId;
  name: string;
  type: CategoryType;
  icon: CategoryIcon;
  createdAt: string;
}

export interface CreateCategoryInput {
  name: string;
  type: CategoryType;
  icon?: CategoryIcon;
}

export interface UpdateCategoryInput {
  name?: string;
  type?: CategoryType;
  icon?: CategoryIcon;
}
