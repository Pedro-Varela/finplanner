"use client";

import { CalendarDays, Flame } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { CategoryHeatmapSeries } from "@/core/usecases";
import { CategoryChip } from "@/components/category-chip";
import { formatCurrency } from "@/lib/utils";

interface CategoryHeatmapProps {
  data: CategoryHeatmapSeries[];
  monthRef: string;
  daysInMonth: number;
}

function intensityClass(amount: number, maxAmount: number): string {
  if (amount <= 0 || maxAmount <= 0) return "bg-muted/30";

  const ratio = amount / maxAmount;
  if (ratio <= 0.25) return "bg-sky-200/60 dark:bg-sky-900/60";
  if (ratio <= 0.5) return "bg-sky-300/70 dark:bg-sky-700/70";
  if (ratio <= 0.75) return "bg-cyan-400/80 dark:bg-cyan-600/80";
  return "bg-emerald-500 dark:bg-emerald-400";
}

function monthLabel(monthRef: string): string {
  const [year, month] = monthRef.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, 1));
  return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" })
    .format(date)
    .replace(/^\w/, (char) => char.toUpperCase());
}

export function CategoryHeatmap({ data, monthRef, daysInMonth }: CategoryHeatmapProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarDays className="h-4 w-4" />
            Heatmap de Despesas por Categoria
          </CardTitle>
          <CardDescription>Sem dados para o filtro atual.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="rounded-xl border border-dashed py-8 text-center text-sm text-muted-foreground">
            Ajuste os filtros para visualizar o mapa de calor diário.
          </p>
        </CardContent>
      </Card>
    );
  }

  const topSeries = data.slice(0, 8);
  const globalPeak = topSeries.reduce((max, row) => Math.max(max, row.peakAmount), 0);

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarDays className="h-4 w-4" />
          Heatmap de Despesas por Categoria
        </CardTitle>
        <CardDescription>
          Intensidade diária em {monthLabel(monthRef)} para detectar picos de gasto por categoria.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Legenda</span>
          <span className="inline-flex items-center gap-1">
            <span className="h-3 w-3 rounded bg-muted/30" />
            sem gasto
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-3 w-3 rounded bg-sky-200/60 dark:bg-sky-900/60" />
            baixo
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-3 w-3 rounded bg-cyan-400/80 dark:bg-cyan-600/80" />
            médio
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-3 w-3 rounded bg-emerald-500 dark:bg-emerald-400" />
            alto
          </span>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[960px] space-y-3">
            <div className="grid grid-cols-[260px_1fr] items-center gap-3 text-[10px] text-muted-foreground">
              <span className="font-medium">Categoria</span>
              <div
                className="grid gap-1"
                style={{ gridTemplateColumns: `repeat(${daysInMonth}, minmax(12px, 1fr))` }}
              >
                {Array.from({ length: daysInMonth }, (_, index) => {
                  const day = index + 1;
                  return (
                    <span key={day} className="text-center">
                      {day % 5 === 0 || day === 1 || day === daysInMonth ? day : ""}
                    </span>
                  );
                })}
              </div>
            </div>

            {topSeries.map((series) => (
              <div
                key={series.categoryId}
                className="grid grid-cols-[260px_1fr] items-center gap-3"
              >
                <div className="space-y-1">
                  <CategoryChip
                    name={series.categoryName}
                    icon={series.categoryIcon}
                    type="expense"
                    className="w-fit"
                  />
                  <p className="text-xs text-muted-foreground">
                    Total {formatCurrency(series.total)}{" "}
                    {series.peakDay ? (
                      <>
                        • Pico dia {series.peakDay} ({formatCurrency(series.peakAmount)})
                      </>
                    ) : (
                      <>• Sem pico identificado</>
                    )}
                  </p>
                </div>

                <div
                  className="grid gap-1"
                  style={{ gridTemplateColumns: `repeat(${daysInMonth}, minmax(12px, 1fr))` }}
                >
                  {series.daily.map((point) => {
                    const isPeak = point.amount > 0 && point.amount === series.peakAmount;
                    return (
                      <span
                        key={point.day}
                        title={`Dia ${point.day}: ${formatCurrency(point.amount)}`}
                        className={`h-4 rounded-sm ${intensityClass(
                          point.amount,
                          globalPeak
                        )} ${isPeak ? "ring-1 ring-amber-400" : ""}`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Flame className="h-3.5 w-3.5 text-amber-500" />
          Dica: quando o pico se repete nos mesmos dias, crie alertas e ajuste o fluxo de caixa.
        </p>
      </CardContent>
    </Card>
  );
}
