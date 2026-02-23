"use client";

import { PieChart as PieChartIcon } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { CategoryBreakdown } from "@/core/usecases";
import { CATEGORY_FAMILY_LABELS } from "@/core/categories/category-taxonomy";
import { getCategoryIconDefinition } from "@/lib/category-icons";

const PALETTE = [
  "#0ea5e9",
  "#10b981",
  "#f97316",
  "#f43f5e",
  "#8b5cf6",
  "#eab308",
  "#14b8a6",
  "#6366f1",
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

interface CategoryPieChartProps {
  data: CategoryBreakdown[];
}

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  const expenseData = data.filter((item) => item.type === "expense");

  if (expenseData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Despesas por categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex min-h-56 flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-muted/20 text-center">
            <PieChartIcon className="h-6 w-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Sem dados de despesas para o filtro atual.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalExpense = expenseData.reduce((acc, item) => acc + item.total, 0);
  const chartData = expenseData.map((item, index) => ({
    ...item,
    fill: PALETTE[index % PALETTE.length],
    percentage: totalExpense > 0 ? (item.total / totalExpense) * 100 : 0,
  }));

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="text-base">Despesas por categoria</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5 lg:grid-cols-[260px_1fr] lg:items-center">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={94}
                paddingAngle={3}
                dataKey="total"
                strokeWidth={0}
              >
                {chartData.map((item) => (
                  <Cell key={item.categoryId} fill={item.fill} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => formatCurrency(Number(value))}
                contentStyle={{
                  borderRadius: "10px",
                  border: "1px solid hsl(var(--border))",
                  backgroundColor: "hsl(var(--background))",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-2">
          {chartData.map((item) => {
            const iconDefinition = getCategoryIconDefinition(item.categoryIcon);
            const Icon = iconDefinition.Icon;

            return (
              <div
                key={item.categoryId}
                className="group rounded-xl border bg-background/70 p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${item.fill}1f`, color: item.fill }}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-medium">{item.categoryName}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.percentage.toFixed(1)}% das despesas •{" "}
                        {CATEGORY_FAMILY_LABELS[item.categoryFamily]}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm font-semibold">{formatCurrency(item.total)}</p>
                </div>

                <div className="mt-2 h-1.5 rounded-full bg-muted">
                  <div
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(Math.max(item.percentage, 4), 100)}%`,
                      backgroundColor: item.fill,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
