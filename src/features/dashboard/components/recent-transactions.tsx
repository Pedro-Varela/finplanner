"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Transaction } from "@/core/entities";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(
    new Date(iso + "T00:00:00")
  );
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Últimas transações</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-6 text-center text-sm text-muted-foreground">Nenhuma transação ainda.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Últimas transações</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {transactions.map((tx) => (
          <div key={tx.id} className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{tx.title}</p>
              <p className="text-xs text-muted-foreground">{formatDate(tx.date)}</p>
            </div>
            <span
              className={`text-sm font-semibold ${
                tx.type === "income" ? "text-emerald-600" : "text-red-500"
              }`}
            >
              {tx.type === "income" ? "+" : "−"} {formatCurrency(tx.amount)}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
