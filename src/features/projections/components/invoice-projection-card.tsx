"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface InvoiceProjectionCardProps {
  estimatedTotal: number;
  differenceFromLastMonth: number;
}

export function InvoiceProjectionCard({
  estimatedTotal,
  differenceFromLastMonth,
}: InvoiceProjectionCardProps) {
  const isUp = differenceFromLastMonth > 0;
  const isDown = differenceFromLastMonth < 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Estimativa da Próxima Fatura</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatCurrency(estimatedTotal)}</div>
        <p className="flex items-center text-xs text-muted-foreground mt-1">
          {isUp ? (
            <TrendingUp className="mr-1 h-3 w-3 text-red-500" />
          ) : isDown ? (
            <TrendingDown className="mr-1 h-3 w-3 text-emerald-500" />
          ) : (
            <Minus className="mr-1 h-3 w-3 text-muted-foreground" />
          )}
          <span
            className={
              isUp ? "text-red-500 font-medium" : isDown ? "text-emerald-500 font-medium" : ""
            }
          >
            {isUp ? "+" : ""}
            {formatCurrency(differenceFromLastMonth)}
          </span>
          <span className="ml-1">em relação ao mês passado</span>
        </p>
      </CardContent>
    </Card>
  );
}
