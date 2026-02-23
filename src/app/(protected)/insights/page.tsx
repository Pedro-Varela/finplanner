"use client";

import { useEffect, useState } from "react";
import { getInsightsAction, resolveInsightAction } from "@/features/insights/actions";
import type { Insight, InsightId } from "@/core/entities/insight";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Lightbulb, Info } from "lucide-react";

export default function InsightsPage() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    const res = await getInsightsAction(); // We assume this gets active insights for now, you can expand to 'all' if needed
    if (res.success) {
      setInsights(res.data);
    } else {
      toast.error(res.error);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleResolve(id: string) {
    const res = await resolveInsightAction(id as InsightId);
    if (res.success) {
      toast.success("Insight marcado como resolvido!");
      setInsights((prev) => prev.filter((i) => i.id !== id));
    } else {
      toast.error(res.error);
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Carregando insights...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Insights & Notificações</h1>
        <p className="text-muted-foreground">
          Fique por dentro do seu comportamento financeiro com sugestões automáticas.
        </p>
      </div>

      <div className="grid gap-4">
        {insights.length === 0 ? (
          <div className="p-8 text-center border rounded-lg bg-card/50 text-muted-foreground text-sm">
            Tudo tranquilo! Você não tem novos alertas no momento.
          </div>
        ) : (
          insights.map((insight) => {
            const Icon =
              insight.type === "warning"
                ? AlertCircle
                : insight.type === "suggestion"
                  ? Lightbulb
                  : Info;

            const iconColor =
              insight.type === "warning"
                ? "text-amber-500"
                : insight.type === "suggestion"
                  ? "text-blue-500"
                  : "text-emerald-500";

            return (
              <Card
                key={insight.id}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center"
              >
                <CardHeader className="flex flex-row items-start space-y-0 gap-4">
                  <div className={`mt-1 ${iconColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{insight.title}</CardTitle>
                    <CardDescription className="mt-1">{insight.description}</CardDescription>
                    <p className="text-xs text-muted-foreground mt-2">
                      Recebido{" "}
                      {formatDistanceToNow(new Date(insight.createdAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                </CardHeader>
                <div className="px-6 pb-6 sm:pb-0 sm:py-6 w-full sm:w-auto flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => handleResolve(insight.id)}>
                    Marcar como lido
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
