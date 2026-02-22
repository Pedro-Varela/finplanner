"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import type { DashboardData } from "@/core/usecases";
import { getDashboardDataAction } from "../actions";
import { SummaryCards } from "./summary-cards";
import { MonthlyChart } from "./monthly-chart";

export function DashboardView() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, startTransition] = useTransition();

  const load = useCallback(() => {
    startTransition(async () => {
      const result = await getDashboardDataAction();
      if (result.success) {
        setData(result.data);
      } else {
        toast.error(result.error);
      }
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (isLoading && !data) {
    return (
      <div className="space-y-6">
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral das suas finanças.</p>
      </div>

      {data && (
        <>
          <SummaryCards summary={data.summary} />
          <MonthlyChart data={data.monthly} />
        </>
      )}
    </div>
  );
}
