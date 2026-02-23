"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { CategoryTrend } from "@/core/usecases";

interface CategoryTrendsCardProps {
  trends: CategoryTrend[];
}

export function CategoryTrendsCard({ trends }: CategoryTrendsCardProps) {
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle>Tendências de Gastos</CardTitle>
        <CardDescription>
          Comparação dos gastos do mês atual contra a média dos últimos 3 meses
        </CardDescription>
      </CardHeader>
      <CardContent>
        {trends.length === 0 ? (
          <p className="text-sm text-muted-foreground">Não há dados suficientes para tendências.</p>
        ) : (
          <div className="space-y-4">
            {trends.map((trend) => {
              const Icon =
                trend.trend === "up" ? TrendingUp : trend.trend === "down" ? TrendingDown : Minus;
              const iconColor =
                trend.trend === "up"
                  ? "text-red-500"
                  : trend.trend === "down"
                    ? "text-emerald-500"
                    : "text-muted-foreground";
              const valueColor =
                trend.trend === "up"
                  ? "text-red-500"
                  : trend.trend === "down"
                    ? "text-emerald-500"
                    : "";

              return (
                <div key={trend.categoryId} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{trend.categoryName}</p>
                    <p className="text-sm text-muted-foreground">
                      Média: {formatCurrency(trend.averageAmount)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(trend.currentAmount)}</p>
                      <p className={`text-xs flex items-center justify-end ${valueColor}`}>
                        <Icon className={`mr-1 h-3 w-3 ${iconColor}`} />
                        {trend.percentageChange > 0 ? "+" : ""}
                        {trend.percentageChange.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
