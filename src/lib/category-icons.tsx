import {
  BriefcaseBusiness,
  Bus,
  Car,
  ChartCandlestick,
  Dumbbell,
  Gamepad2,
  Gift,
  GraduationCap,
  HeartPulse,
  Home,
  Landmark,
  PawPrint,
  PiggyBank,
  Plane,
  Popcorn,
  Receipt,
  Shirt,
  ShoppingBag,
  Smartphone,
  Tag,
  Utensils,
  Wifi,
  type LucideIcon,
} from "lucide-react";
import {
  CATEGORY_ICON_OPTIONS,
  DEFAULT_CATEGORY_ICON,
  isCategoryIcon,
  type CategoryIcon,
} from "@/core/entities";

export interface CategoryIconDefinition {
  id: CategoryIcon;
  label: string;
  Icon: LucideIcon;
}

const CATEGORY_ICON_META: Record<CategoryIcon, Omit<CategoryIconDefinition, "id">> = {
  tag: { label: "Geral", Icon: Tag },
  utensils: { label: "Alimentacao", Icon: Utensils },
  car: { label: "Transporte", Icon: Car },
  bus: { label: "Mobilidade", Icon: Bus },
  home: { label: "Moradia", Icon: Home },
  "shopping-bag": { label: "Compras", Icon: ShoppingBag },
  "heart-pulse": { label: "Saude", Icon: HeartPulse },
  briefcase: { label: "Trabalho", Icon: BriefcaseBusiness },
  "graduation-cap": { label: "Educacao", Icon: GraduationCap },
  landmark: { label: "Tributos", Icon: Landmark },
  "piggy-bank": { label: "Reserva", Icon: PiggyBank },
  "chart-candlestick": { label: "Investimentos", Icon: ChartCandlestick },
  receipt: { label: "Contas", Icon: Receipt },
  dumbbell: { label: "Bem-estar", Icon: Dumbbell },
  plane: { label: "Viagem", Icon: Plane },
  gift: { label: "Presentes", Icon: Gift },
  "gamepad-2": { label: "Games", Icon: Gamepad2 },
  popcorn: { label: "Lazer", Icon: Popcorn },
  shirt: { label: "Moda", Icon: Shirt },
  smartphone: { label: "Tecnologia", Icon: Smartphone },
  wifi: { label: "Internet", Icon: Wifi },
  "paw-print": { label: "Pets", Icon: PawPrint },
};

export const CATEGORY_ICON_DEFINITIONS: CategoryIconDefinition[] = CATEGORY_ICON_OPTIONS.map(
  (id) => ({
    id,
    ...CATEGORY_ICON_META[id],
  })
);

const CATEGORY_ICON_BY_ID = new Map(CATEGORY_ICON_DEFINITIONS.map((item) => [item.id, item]));

export function resolveCategoryIcon(icon: string | null | undefined): CategoryIcon {
  if (!icon) return DEFAULT_CATEGORY_ICON;
  return isCategoryIcon(icon) ? icon : DEFAULT_CATEGORY_ICON;
}

export function getCategoryIconDefinition(icon: string | null | undefined): CategoryIconDefinition {
  const resolved = resolveCategoryIcon(icon);
  return CATEGORY_ICON_BY_ID.get(resolved) ?? CATEGORY_ICON_BY_ID.get(DEFAULT_CATEGORY_ICON)!;
}
