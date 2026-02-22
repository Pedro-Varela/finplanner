"use client";

import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardSummary } from "@/core/usecases";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

interface SummaryCardsProps {
  summary: DashboardSummary;
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  const cards = [
    {
      title: "Receitas",
      value: summary.totalIncome,
      icon: TrendingUp,
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
    },
    {
      title: "Despesas",
      value: summary.totalExpenses,
      icon: TrendingDown,
      color: "text-red-500",
      bg: "bg-red-50 dark:bg-red-950/30",
    },
    {
      title: "Saldo",
      value: summary.balance,
      icon: Wallet,
      color: summary.balance >= 0 ? "text-emerald-600" : "text-red-500",
      bg:
        summary.balance >= 0
          ? "bg-emerald-50 dark:bg-emerald-950/30"
          : "bg-red-50 dark:bg-red-950/30",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => (
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
            {card.title === "Saldo" && (
              <p className="mt-1 text-xs text-muted-foreground">
                {summary.transactionCount} transação{summary.transactionCount !== 1 ? "ões" : ""}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
