"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Category, TransactionFilters } from "@/core/entities";
import { getCategoryIconDefinition } from "@/lib/category-icons";

interface TransactionFiltersBarProps {
  categories: Category[];
  onFiltersChange: (filters: TransactionFilters) => void;
}

export function TransactionFiltersBar({ categories, onFiltersChange }: TransactionFiltersBarProps) {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  function emit(overrides: Partial<TransactionFilters> = {}) {
    const filters: TransactionFilters = {
      search: (overrides.search ?? search) || undefined,
      categoryId: ((overrides.categoryId ?? categoryId) ||
        undefined) as TransactionFilters["categoryId"],
      type: ((overrides.type ?? type) || undefined) as TransactionFilters["type"],
      dateFrom: (overrides.dateFrom ?? dateFrom) || undefined,
      dateTo: (overrides.dateTo ?? dateTo) || undefined,
    };
    onFiltersChange(filters);
  }

  function handleClear() {
    setSearch("");
    setCategoryId("");
    setType("");
    setDateFrom("");
    setDateTo("");
    onFiltersChange({});
  }

  const hasFilters = search || categoryId || type || dateFrom || dateTo;

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-card p-4">
      <div className="flex-1 min-w-[200px]">
        <label className="mb-1 block text-xs font-medium text-muted-foreground">Buscar</label>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título..."
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              emit({ search: e.target.value || undefined });
            }}
          />
        </div>
      </div>

      <div className="w-40">
        <label className="mb-1 block text-xs font-medium text-muted-foreground">Categoria</label>
        <Select
          value={categoryId}
          onValueChange={(v) => {
            const val = v === "all" ? "" : v;
            setCategoryId(val);
            emit({ categoryId: (val || undefined) as TransactionFilters["categoryId"] });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {categories.map((cat) => {
              const iconDefinition = getCategoryIconDefinition(cat.icon);
              const Icon = iconDefinition.Icon;
              return (
                <SelectItem key={cat.id} value={cat.id}>
                  <span className="flex items-center gap-2">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-muted">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    {cat.name}
                  </span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="w-36">
        <label className="mb-1 block text-xs font-medium text-muted-foreground">Tipo</label>
        <Select
          value={type}
          onValueChange={(v) => {
            const val = v === "all" ? "" : v;
            setType(val);
            emit({ type: (val || undefined) as TransactionFilters["type"] });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="income">Receita</SelectItem>
            <SelectItem value="expense">Despesa</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-36">
        <label className="mb-1 block text-xs font-medium text-muted-foreground">De</label>
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => {
            setDateFrom(e.target.value);
            emit({ dateFrom: e.target.value || undefined });
          }}
        />
      </div>

      <div className="w-36">
        <label className="mb-1 block text-xs font-medium text-muted-foreground">Até</label>
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => {
            setDateTo(e.target.value);
            emit({ dateTo: e.target.value || undefined });
          }}
        />
      </div>

      {hasFilters && (
        <Button variant="ghost" size="icon" onClick={handleClear} className="shrink-0">
          <X className="h-4 w-4" />
          <span className="sr-only">Limpar filtros</span>
        </Button>
      )}
    </div>
  );
}
