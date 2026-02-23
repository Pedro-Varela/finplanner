import type { CategoryType } from "@/core/entities";
import { getCategoryIconDefinition } from "@/lib/category-icons";
import { cn } from "@/lib/utils";

interface CategoryChipProps {
  name: string;
  icon?: string | null;
  type?: CategoryType;
  className?: string;
}

const TYPE_TONE: Record<CategoryType, string> = {
  income:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300",
  expense:
    "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300",
};

export function CategoryChip({ name, icon, type, className }: CategoryChipProps) {
  const iconDefinition = getCategoryIconDefinition(icon);
  const Icon = iconDefinition.Icon;
  const tone = type ? TYPE_TONE[type] : "border-muted-foreground/20 bg-background text-foreground";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium",
        tone,
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{name}</span>
    </span>
  );
}
