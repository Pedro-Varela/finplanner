"use client";

import { useEffect, useState } from "react";
import { getProjectionsAction } from "../actions";
import type { ProjectionsData } from "@/core/usecases";
import { InvoiceProjectionCard } from "./invoice-projection-card";
import { CategoryTrendsCard } from "./category-trends-card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function ProjectionsDashboard() {
  const [data, setData] = useState<ProjectionsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const result = await getProjectionsAction();
      if (result.success) {
        setData(result.data);
      } else {
        toast.error(result.error);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando projeções...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-12 text-center text-muted-foreground">
        Não foi possível carregar os dados de projeção.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <InvoiceProjectionCard
          estimatedTotal={data.invoiceEstimatedTotal}
          differenceFromLastMonth={data.invoiceDifferenceFromLastMonth}
        />
      </div>

      <CategoryTrendsCard trends={data.trendingCategories} />
    </div>
  );
}
