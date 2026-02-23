"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { Filter } from "lucide-react";
import { toast } from "sonner";
import type { DashboardData } from "@/core/usecases";
import { CATEGORY_FAMILY_LABELS, type CategoryFamily } from "@/core/categories/category-taxonomy";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getDashboardDataAction } from "../actions";
import { SummaryCards } from "./summary-cards";
import { MonthlyChart } from "./monthly-chart";
import { CategoryPieChart } from "./category-pie-chart";
import { CategoryHeatmap } from "./category-heatmap";
import { RecentTransactions } from "./recent-transactions";

const FAMILY_FILTER_OPTIONS: Array<{ value: "all" | CategoryFamily; label: string }> = [
  { value: "all", label: "Todas as famílias" },
  ...Object.entries(CATEGORY_FAMILY_LABELS).map(([value, label]) => ({
    value: value as CategoryFamily,
    label,
  })),
];

const MIN_AMOUNT_OPTIONS = [
  { value: "0", label: "Sem mínimo" },
  { value: "100", label: "A partir de R$ 100" },
  { value: "300", label: "A partir de R$ 300" },
  { value: "700", label: "A partir de R$ 700" },
  { value: "1500", label: "A partir de R$ 1.500" },
];

function normalizeSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function DashboardView() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, startTransition] = useTransition();
  const [familyFilter, setFamilyFilter] = useState<"all" | CategoryFamily>("all");
  const [minAmountFilter, setMinAmountFilter] = useState("0");
  const [categorySearch, setCategorySearch] = useState("");

  const load = useCallback(() => {
    startTransition(async () => {
      const result = await getDashboardDataAction();
      if (result.success) setData(result.data);
      else toast.error(result.error);
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const normalizedSearch = normalizeSearch(categorySearch);
  const minAmount = Number(minAmountFilter);

  const filteredCategoryBreakdown = useMemo(() => {
    if (!data) return [];
    return data.byCategory.filter((row) => {
      const familyMatch = familyFilter === "all" || row.categoryFamily === familyFilter;
      const amountMatch = row.total >= minAmount;
      const searchMatch =
        !normalizedSearch || normalizeSearch(row.categoryName).includes(normalizedSearch);
      return familyMatch && amountMatch && searchMatch;
    });
  }, [data, familyFilter, minAmount, normalizedSearch]);

  const filteredCategoryHeatmap = useMemo(() => {
    if (!data) return [];
    return data.categoryHeatmap.filter((row) => {
      const familyMatch = familyFilter === "all" || row.categoryFamily === familyFilter;
      const amountMatch = row.total >= minAmount;
      const searchMatch =
        !normalizedSearch || normalizeSearch(row.categoryName).includes(normalizedSearch);
      return familyMatch && amountMatch && searchMatch;
    });
  }, [data, familyFilter, minAmount, normalizedSearch]);

  if (isLoading && !data) {
    return (
      <div className="animate-stagger space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral das suas finanças.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl border bg-muted/40" />
          ))}
        </div>
        <div className="h-96 animate-pulse rounded-xl border bg-muted/40" />
      </div>
    );
  }

  return (
    <div className="animate-stagger space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Resumo do mês atual —{" "}
          {new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(new Date())}
        </p>
      </div>

      {data && (
        <>
          <SummaryCards summary={data.summary} previousSummary={data.previousMonthSummary} />

          <Card className="border-dashed">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Filter className="h-4 w-4" />
                Filtros avançados de categoria
              </CardTitle>
              <CardDescription>
                Filtre por família, valor mínimo e busca textual para análises mais precisas.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Família</label>
                <Select
                  value={familyFilter}
                  onValueChange={(value) => setFamilyFilter(value as "all" | CategoryFamily)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FAMILY_FILTER_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Faixa de valor</label>
                <Select value={minAmountFilter} onValueChange={setMinAmountFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MIN_AMOUNT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Buscar categoria
                </label>
                <Input
                  value={categorySearch}
                  onChange={(event) => setCategorySearch(event.target.value)}
                  placeholder="Ex: mercado, aluguel, saúde..."
                />
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <MonthlyChart data={data.monthly} />
            <CategoryPieChart data={filteredCategoryBreakdown} />
          </div>

          <CategoryHeatmap
            data={filteredCategoryHeatmap}
            monthRef={data.currentMonthRef}
            daysInMonth={data.daysInCurrentMonth}
          />

          <RecentTransactions transactions={data.recentTransactions} />
        </>
      )}
    </div>
  );
}
