"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Gauge,
  Layers,
  PiggyBank,
  Target,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import {
  calculateEnvelopeStatus,
  generateStrategicInsights,
  type EnvelopeConfig,
  type EnvelopeStatus,
  type FinancialScore,
  type FinancialSnapshot,
  type StrategicInsight,
} from "@/core/financial-intelligence";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getFinancialScoreDataAction } from "../actions";

interface ScoreData {
  snapshot: FinancialSnapshot;
  score: FinancialScore;
}

const PRESETS: Array<{ label: string; config: EnvelopeConfig }> = [
  { label: "Clássico 50/30/20", config: { essentialsPct: 50, leisurePct: 30, investmentsPct: 20 } },
  {
    label: "Conservador 60/20/20",
    config: { essentialsPct: 60, leisurePct: 20, investmentsPct: 20 },
  },
  {
    label: "Agressivo 45/20/35",
    config: { essentialsPct: 45, leisurePct: 20, investmentsPct: 35 },
  },
];

function scoreTone(score: number): { label: string; color: string } {
  if (score >= 80) return { label: "Excelente", color: "text-emerald-300" };
  if (score >= 65) return { label: "Saudável", color: "text-sky-200" };
  if (score >= 50) return { label: "Atenção", color: "text-amber-200" };
  return { label: "Crítico", color: "text-rose-200" };
}

function envelopeStatusColor(status: EnvelopeStatus["status"]) {
  if (status === "ok") return "text-emerald-600 bg-emerald-50 border-emerald-100";
  if (status === "warning") return "text-amber-600 bg-amber-50 border-amber-100";
  return "text-rose-600 bg-rose-50 border-rose-100";
}

function bucketBarColor(status: "ok" | "warning" | "over") {
  if (status === "ok") return "bg-emerald-500";
  if (status === "warning") return "bg-amber-500";
  return "bg-rose-500";
}

function insightAction(insight: StrategicInsight): { href: string; label: string } {
  if (insight.type === "negative_balance_risk")
    return { href: "/forecast", label: "Abrir forecast" };
  if (insight.type === "growing_expense_trend")
    return { href: "/projections", label: "Ver tendência" };
  if (insight.type === "category_dependency")
    return { href: "/categories", label: "Rever categorias" };
  if (insight.type === "low_savings") return { href: "/transactions", label: "Revisar gastos" };
  return { href: "/transactions", label: "Abrir transações" };
}

function ScoreRing({ score }: { score: number }) {
  const size = 150;
  const stroke = 11;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (Math.max(0, Math.min(score, 100)) / 100) * circumference;

  return (
    <div className="relative h-[150px] w-[150px]">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.25)"
          strokeWidth={stroke}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="white"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
          fill="transparent"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
        <span className="text-4xl font-black leading-none">{score}</span>
        <span className="text-xs uppercase tracking-[0.2em]">de 100</span>
      </div>
    </div>
  );
}

interface BreakdownBarProps {
  label: string;
  value: number;
}

function BreakdownBar({ label, value }: BreakdownBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-muted">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-sky-500 to-emerald-500"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export function FinancialScoreDashboard() {
  const [data, setData] = useState<ScoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<EnvelopeConfig>({
    essentialsPct: 50,
    leisurePct: 30,
    investmentsPct: 20,
  });

  useEffect(() => {
    async function load() {
      const result = await getFinancialScoreDataAction();
      if (!result.success) {
        toast.error(result.error);
        setLoading(false);
        return;
      }

      setData(result.data);
      setLoading(false);
    }

    load();
  }, []);

  const envelope = useMemo(() => {
    if (!data) return null;
    return calculateEnvelopeStatus(data.snapshot, config);
  }, [data, config]);

  const strategicInsights = useMemo(() => {
    if (!data || !envelope) return [];
    return generateStrategicInsights(data.snapshot, data.score, envelope);
  }, [data, envelope]);

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-dashed p-12 text-muted-foreground">
        Calculando inteligência financeira...
      </div>
    );
  }

  if (!data || !envelope) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center text-muted-foreground">
        Não foi possível carregar o score financeiro.
      </div>
    );
  }

  const tone = scoreTone(data.score.overallScore);

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden border-none bg-gradient-to-br from-sky-700 via-cyan-600 to-emerald-500 text-white shadow-xl">
        <div className="absolute -left-14 -top-16 h-44 w-44 rounded-full bg-white/20 blur-2xl" />
        <div className="absolute -bottom-12 -right-10 h-40 w-40 rounded-full bg-emerald-200/40 blur-2xl" />
        <CardContent className="relative grid gap-6 p-6 md:grid-cols-[auto_1fr] md:items-center md:p-8">
          <ScoreRing score={data.score.overallScore} />
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-white/75">
                Financial Intelligence
              </p>
              <h2 className="mt-1 text-3xl font-black tracking-tight">Seu Score Financeiro</h2>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-white/20 text-white hover:bg-white/25">
                Mês {data.snapshot.monthRef}
              </Badge>
              <Badge className="bg-white/20 text-white hover:bg-white/25">{tone.label}</Badge>
              <Badge className="bg-white/20 text-white hover:bg-white/25">
                Saldo projetado {formatCurrency(data.snapshot.projectedEndOfMonthBalance)}
              </Badge>
            </div>
            <p className={`text-sm font-semibold ${tone.color}`}>
              Taxa de poupança: {data.snapshot.savingsRate.toFixed(1)}% | Comprometimento
              recorrente: {data.snapshot.recurringCommitmentRate.toFixed(1)}%
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Gauge className="h-5 w-5" />
              Breakdown do Score
            </CardTitle>
            <CardDescription>Pilares que compõem sua nota final de 0 a 100.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <BreakdownBar label="Poupança" value={data.score.breakdown.savingsScore} />
            <BreakdownBar label="Comprometimento" value={data.score.breakdown.commitmentScore} />
            <BreakdownBar label="Previsibilidade" value={data.score.breakdown.forecastScore} />
            <BreakdownBar label="Estabilidade" value={data.score.breakdown.stabilityScore} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5" />
              Envelope Digital
            </CardTitle>
            <CardDescription>Teste distribuições e veja seu status em tempo real.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <Button
                  key={preset.label}
                  variant="outline"
                  size="sm"
                  onClick={() => setConfig(preset.config)}
                >
                  {preset.label}
                </Button>
              ))}
            </div>

            <div
              className={`rounded-md border px-3 py-2 text-sm font-medium ${envelopeStatusColor(envelope.status)}`}
            >
              Status geral do envelope: {envelope.status.toUpperCase()}
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Essenciais: {config.essentialsPct}%</label>
              <input
                type="range"
                min={0}
                max={100}
                value={config.essentialsPct}
                onChange={(event) =>
                  setConfig((prev) => ({ ...prev, essentialsPct: Number(event.target.value) }))
                }
                className="w-full"
              />

              <label className="text-sm font-medium">Estilo de vida: {config.leisurePct}%</label>
              <input
                type="range"
                min={0}
                max={100}
                value={config.leisurePct}
                onChange={(event) =>
                  setConfig((prev) => ({ ...prev, leisurePct: Number(event.target.value) }))
                }
                className="w-full"
              />

              <label className="text-sm font-medium">Investimentos: {config.investmentsPct}%</label>
              <input
                type="range"
                min={0}
                max={100}
                value={config.investmentsPct}
                onChange={(event) =>
                  setConfig((prev) => ({ ...prev, investmentsPct: Number(event.target.value) }))
                }
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Layers className="h-5 w-5" />
              Pressão por Categoria
            </CardTitle>
            <CardDescription>Categorias com maior impacto nas despesas do mês.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.snapshot.topCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem despesas categorizadas neste mês.</p>
            ) : (
              data.snapshot.topCategories.map((category) => (
                <div key={category.categoryId} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{category.categoryName}</span>
                    <span className="font-medium">
                      {category.percentage.toFixed(1)}% ({formatCurrency(category.amount)})
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-rose-500 to-orange-400"
                      style={{ width: `${Math.min(category.percentage, 100)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <PiggyBank className="h-5 w-5" />
              Status do Envelope (Real x Meta)
            </CardTitle>
            <CardDescription>A meta é normalizada automaticamente para 100%.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Essenciais", data: envelope.essentials },
              { label: "Estilo de vida", data: envelope.leisure },
              { label: "Investimentos", data: envelope.investments },
            ].map((bucket) => (
              <div key={bucket.label} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{bucket.label}</span>
                  <span className="font-medium">
                    {bucket.data.actualPct.toFixed(1)}% / meta {bucket.data.targetPct.toFixed(1)}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className={`h-2 rounded-full ${bucketBarColor(bucket.data.status)}`}
                    style={{ width: `${Math.min(bucket.data.actualPct, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5" />
            Insights Estratégicos
          </CardTitle>
          <CardDescription>
            Alertas acionáveis derivados do snapshot, score e envelope.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {strategicInsights.length === 0 ? (
            <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
              Nenhum risco estrutural relevante detectado. Continue mantendo consistência.
            </div>
          ) : (
            strategicInsights.map((insight) => {
              const action = insightAction(insight);
              const isCritical = insight.severity === "critical" || insight.severity === "high";

              return (
                <div
                  key={insight.id}
                  className="flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      {isCritical ? (
                        <AlertTriangle className="h-4 w-4 text-rose-500" />
                      ) : (
                        <Activity className="h-4 w-4 text-sky-500" />
                      )}
                      <p className="font-semibold">{insight.title}</p>
                      <Badge variant="outline">{insight.severity}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{insight.description}</p>
                  </div>
                  <Button variant="outline" asChild>
                    <Link href={action.href}>
                      {action.label}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
