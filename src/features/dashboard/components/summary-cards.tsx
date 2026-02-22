"use client";

import { TrendingUp, TrendingDown, Wallet, ArrowUp, ArrowDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardSummary } from "@/core/usecases";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return ((current - previous) / previous) * 100;
}

interface SummaryCardsProps {
  summary: DashboardSummary;
  previousSummary: DashboardSummary;
}

export function SummaryCards({ summary, previousSummary }: SummaryCardsProps) {
  const cards = [
    {
      title: "Receitas",
      value: summary.totalIncome,
      previous: previousSummary.totalIncome,
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      positiveIsGood: true,
    },
    {
      title: "Despesas",
      value: summary.totalExpenses,
      previous: previousSummary.totalExpenses,
      icon: TrendingDown,
      color: "text-red-500",
      bg: "bg-red-50 dark:bg-red-950/30",
      positiveIsGood: false,
    },
    {
      title: "Saldo",
      value: summary.balance,
      previous: previousSummary.balance,
      icon: Wallet,
      color: summary.balance >= 0 ? "text-emerald-600" : "text-red-500",
      bg:
        summary.balance >= 0
          ? "bg-emerald-50 dark:bg-emerald-950/30"
          : "bg-red-50 dark:bg-red-950/30",
      positiveIsGood: true,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => {
        const pct = percentChange(card.value, card.previous);
        const isPositive = pct !== null && pct > 0;
        const isNegative = pct !== null && pct < 0;
        const changeIsGood = card.positiveIsGood ? isPositive : isNegative;

        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className={`rounded-md p-2 ${card.bg}`}>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${card.color}`}>{formatCurrency(card.value)}</p>
              <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                {pct !== null ? (
                  <>
                    {isPositive ? (
                      <ArrowUp
                        className={`h-3 w-3 ${changeIsGood ? "text-emerald-500" : "text-red-500"}`}
                      />
                    ) : isNegative ? (
                      <ArrowDown
                        className={`h-3 w-3 ${changeIsGood ? "text-emerald-500" : "text-red-500"}`}
                      />
                    ) : (
                      <Minus className="h-3 w-3" />
                    )}
                    <span
                      className={
                        changeIsGood
                          ? "text-emerald-500"
                          : isPositive || isNegative
                            ? "text-red-500"
                            : ""
                      }
                    >
                      {Math.abs(pct).toFixed(1)}%
                    </span>
                    <span>vs mês anterior</span>
                  </>
                ) : (
                  <span>
                    {card.title === "Saldo"
                      ? `${summary.transactionCount} transaç${summary.transactionCount !== 1 ? "ões" : "ão"}`
                      : "Sem dados anteriores"}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
