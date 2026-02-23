"use client";

import type { CategoryIcon } from "@/core/entities";
import { CATEGORY_ICON_DEFINITIONS, getCategoryIconDefinition } from "@/lib/category-icons";
import { cn } from "@/lib/utils";

interface CategoryIconPickerProps {
  value: CategoryIcon;
  onChange: (icon: CategoryIcon) => void;
}

export function CategoryIconPicker({ value, onChange }: CategoryIconPickerProps) {
  const selected = getCategoryIconDefinition(value);
  const SelectedIcon = selected.Icon;

  return (
    <div className="space-y-3 rounded-xl border bg-muted/20 p-3">
      <div className="flex items-center gap-2 text-sm font-medium">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <SelectedIcon className="h-4 w-4" />
        </span>
        <span>
          Icone selecionado: <span className="text-primary">{selected.label}</span>
        </span>
      </div>

      <div className="grid max-h-48 grid-cols-5 gap-2 overflow-y-auto pr-1 sm:grid-cols-6">
        {CATEGORY_ICON_DEFINITIONS.map((definition) => {
          const Icon = definition.Icon;
          const isActive = definition.id === value;

          return (
            <button
              key={definition.id}
              type="button"
              onClick={() => onChange(definition.id)}
              className={cn(
                "group flex flex-col items-center justify-center gap-1 rounded-lg border p-2 text-center text-[10px] font-medium transition-all duration-200",
                isActive
                  ? "border-primary bg-primary/10 text-primary shadow-sm"
                  : "border-muted-foreground/20 bg-background text-muted-foreground hover:-translate-y-0.5 hover:border-primary/40 hover:text-foreground"
              )}
              title={definition.label}
            >
              <Icon className="h-4 w-4" />
              <span className="line-clamp-1 w-full">{definition.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
