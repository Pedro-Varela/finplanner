"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getInsightsAction, resolveInsightAction } from "@/features/insights/actions";
import type { Insight, InsightId } from "@/core/entities/insight";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowRight, Info, Lightbulb } from "lucide-react";

interface InsightDestination {
  href: string;
  label: string;
}

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function resolveInsightDestination(insight: Insight): InsightDestination {
  const content = normalize(`${insight.title} ${insight.description}`);

  if (
    content.includes("score") ||
    content.includes("poupanca") ||
    content.includes("saldo") ||
    content.includes("orcamento") ||
    content.includes("estrutura de custo") ||
    content.includes("dependencia") ||
    content.includes("tendencia")
  ) {
    return { href: "/score", label: "Ver score" };
  }

  if (
    content.includes("recorrente") ||
    content.includes("assinatura") ||
    content.includes("pendente")
  ) {
    return { href: "/transactions", label: "Ver transações" };
  }

  if (content.includes("categoria")) {
    return { href: "/categories", label: "Ver categorias" };
  }

  if (content.includes("forecast") || content.includes("projec")) {
    return { href: "/forecast", label: "Ver forecast" };
  }

  return { href: "/transactions", label: "Ver transações" };
}

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
            const destination = resolveInsightDestination(insight);
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
                  <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                    <Button variant="secondary" size="sm" asChild>
                      <Link href={destination.href}>
                        {destination.label}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleResolve(insight.id)}>
                      Marcar como lido
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
