"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Gauge,
  Layers,
  Loader2,
  PiggyBank,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import {
  calculateEnvelopeStatus,
  ESSENTIAL_CATEGORY_KEYWORDS,
  generateStrategicInsights,
  INVESTMENT_CATEGORY_KEYWORDS,
  type EnvelopeConfig,
  type EnvelopeStatus,
  type FinancialScore,
  type FinancialSnapshot,
  type StrategicInsight,
} from "@/core/financial-intelligence";
import { getCategoryIconDefinition } from "@/lib/category-icons";
import { cn, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getFinancialScoreDataAction } from "../actions";

interface ScoreData {
  snapshot: FinancialSnapshot;
  score: FinancialScore;
  selectedMonth: string;
  availableMonths: string[];
}

interface PillarExplanation {
  id: keyof FinancialScore["breakdown"];
  title: string;
  formula: string;
  description: string;
  improveTip: string;
}

const PRESETS: Array<{ label: string; config: EnvelopeConfig }> = [
  {
    label: "Clássico 50/30/20",
    config: { essentialsPct: 50, leisurePct: 30, investmentsPct: 20 },
  },
  {
    label: "Conservador 60/20/20",
    config: { essentialsPct: 60, leisurePct: 20, investmentsPct: 20 },
  },
  {
    label: "Agressivo 45/20/35",
    config: { essentialsPct: 45, leisurePct: 20, investmentsPct: 35 },
  },
];

const PILLAR_EXPLANATIONS: PillarExplanation[] = [
  {
    id: "savingsScore",
    title: "Poupança",
    formula: "(Renda - Despesas) / Renda",
    description: "Mostra quanto da sua renda realmente sobra no fim do mês.",
    improveTip: "Reduza despesas variáveis e defina um teto semanal para aumentar a sobra.",
  },
  {
    id: "commitmentScore",
    title: "Comprometimento",
    formula: "Recorrentes / Renda",
    description: "Mede quanto da sua renda já está travada em compromissos fixos.",
    improveTip: "Renegocie contratos, corte assinaturas e evite novas parcelas longas.",
  },
  {
    id: "forecastScore",
    title: "Previsibilidade",
    formula: "Projeção de fechamento do mês",
    description: "Avalia se a tendência atual leva a folga ou pressão no saldo final.",
    improveTip: "Distribua despesas grandes ao longo do mês e antecipe picos de saída.",
  },
  {
    id: "stabilityScore",
    title: "Estabilidade",
    formula: "Concentração de despesas por categoria",
    description: "Mede o risco de depender demais de uma única categoria de gasto.",
    improveTip: "Dilua gastos concentrados e revise categorias com peso excessivo.",
  },
];

type DidacticStatus = "saudavel" | "atencao" | "critico";

interface DidacticStatusMeta {
  label: string;
  description: string;
  chipClassName: string;
  dotClassName: string;
}

function didacticStatusMeta(status: EnvelopeStatus["status"]): DidacticStatusMeta {
  if (status === "ok") {
    return {
      label: "Saudável",
      description: "Distribuição equilibrada, sem desvios relevantes.",
      chipClassName:
        "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300",
      dotClassName: "bg-emerald-500",
    };
  }

  if (status === "warning") {
    return {
      label: "Atenção",
      description: "Há desequilíbrio moderado que já pede ajuste.",
      chipClassName:
        "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300",
      dotClassName: "bg-amber-500",
    };
  }

  return {
    label: "Crítico",
    description: "Desequilíbrio forte com risco de apertar o caixa.",
    chipClassName:
      "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300",
    dotClassName: "bg-rose-500",
  };
}

function bucketBarColor(status: EnvelopeStatus["status"]) {
  if (status === "ok") return "bg-emerald-500";
  if (status === "warning") return "bg-amber-500";
  return "bg-rose-500";
}

function insightAction(insight: StrategicInsight): { href: string; label: string } {
  if (insight.type === "negative_balance_risk") {
    return { href: "/forecast", label: "Abrir forecast" };
  }

  if (insight.type === "growing_expense_trend") {
    return { href: "/projections", label: "Ver tendência" };
  }

  if (insight.type === "category_dependency") {
    return { href: "/categories", label: "Rever categorias" };
  }

  if (insight.type === "low_savings") {
    return { href: "/transactions", label: "Revisar gastos" };
  }

  return { href: "/transactions", label: "Abrir transações" };
}

function pillarLevel(score: number): string {
  if (score >= 80) return "forte";
  if (score >= 60) return "estável";
  if (score >= 40) return "atenção";
  return "frágil";
}

function formatMonthRef(monthRef: string): string {
  const [year, month] = monthRef.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, 1));
  const formatted = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function scoreTone(score: number): { label: string; color: string } {
  if (score >= 80) return { label: "Excelente", color: "text-emerald-300" };
  if (score >= 65) return { label: "Saudável", color: "text-sky-200" };
  if (score >= 50) return { label: "Atenção", color: "text-amber-200" };
  return { label: "Crítico", color: "text-rose-200" };
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

function EnvelopeStatusChip({ status }: { status: EnvelopeStatus["status"] }) {
  const meta = didacticStatusMeta(status);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide shadow-sm",
        meta.chipClassName
      )}
    >
      <span className={cn("h-2 w-2 rounded-full", meta.dotClassName)} />
      Status {meta.label}
    </span>
  );
}

function BreakdownBar({ label, value }: { label: string; value: number }) {
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

function StatusGuideTab() {
  const statuses: Array<{ key: DidacticStatus; status: EnvelopeStatus["status"]; howTo: string }> =
    [
      {
        key: "saudavel",
        status: "ok",
        howTo: "Mantenha desvio de cada bloco até 4 p.p. da meta.",
      },
      {
        key: "atencao",
        status: "warning",
        howTo: "Reduza o bloco acima da meta para abaixo de 8 p.p.",
      },
      {
        key: "critico",
        status: "over",
        howTo: "Replaneje categorias e corte imediato em blocos superdimensionados.",
      },
    ];

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {statuses.map((item) => {
        const meta = didacticStatusMeta(item.status);
        return (
          <div key={item.key} className={cn("rounded-xl border p-4", meta.chipClassName)}>
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold">{meta.label}</p>
              <EnvelopeStatusChip status={item.status} />
            </div>
            <p className="mt-2 text-sm">{meta.description}</p>
            <p className="mt-2 text-xs font-medium">Como chegar: {item.howTo}</p>
          </div>
        );
      })}
    </div>
  );
}

function ClassificationGuideTab() {
  const essentialExamples = ESSENTIAL_CATEGORY_KEYWORDS.slice(0, 8);
  const investmentExamples = INVESTMENT_CATEGORY_KEYWORDS.slice(0, 8);

  return (
    <div className="grid gap-3 md:grid-cols-3">
      <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 dark:border-sky-900/60 dark:bg-sky-950/30">
        <p className="font-semibold text-sky-700 dark:text-sky-300">Essenciais</p>
        <p className="mt-1 text-sm text-sky-700 dark:text-sky-300">
          Moradia, contas básicas, alimentação, saúde, transporte, educação e impostos.
        </p>
        <div className="mt-2 flex flex-wrap gap-1">
          {essentialExamples.map((keyword) => (
            <Badge key={keyword} variant="outline" className="border-sky-300 text-sky-700">
              {keyword}
            </Badge>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/30">
        <p className="font-semibold text-emerald-700 dark:text-emerald-300">Investimentos</p>
        <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-300">
          Aportes financeiros e construção de patrimônio.
        </p>
        <div className="mt-2 flex flex-wrap gap-1">
          {investmentExamples.map((keyword) => (
            <Badge key={keyword} variant="outline" className="border-emerald-300 text-emerald-700">
              {keyword}
            </Badge>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-900/60 dark:bg-violet-950/30">
        <p className="font-semibold text-violet-700 dark:text-violet-300">Estilo de vida</p>
        <p className="mt-1 text-sm text-violet-700 dark:text-violet-300">
          Tudo que não bate com regras de Essenciais ou Investimentos cai aqui por padrão.
        </p>
        <p className="mt-2 text-xs text-violet-700/90 dark:text-violet-300/90">
          Exemplo comum: lazer, restaurantes, compras e entretenimento.
        </p>
      </div>
    </div>
  );
}

function PillarsGuideTab({ score }: { score: FinancialScore }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {PILLAR_EXPLANATIONS.map((pillar) => {
        const value = score.breakdown[pillar.id];
        return (
          <div key={pillar.id} className="rounded-xl border p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold">{pillar.title}</p>
              <Badge variant="outline">
                {value}/100 • {pillarLevel(value)}
              </Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{pillar.description}</p>
            <p className="mt-2 text-xs text-muted-foreground">Fórmula: {pillar.formula}</p>
            <p className="mt-2 text-xs font-medium text-foreground">{pillar.improveTip}</p>
          </div>
        );
      })}
    </div>
  );
}

function ScoreHelpCenter({ score }: { score: FinancialScore }) {
  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5" />
          Entenda como funciona o score
        </CardTitle>
        <CardDescription>
          Uma seção de ajuda separada para entender pilares, classificação e status.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pillars" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pillars">Pilares</TabsTrigger>
            <TabsTrigger value="classification">Classificação</TabsTrigger>
            <TabsTrigger value="status">Status</TabsTrigger>
          </TabsList>

          <TabsContent value="pillars" className="animate-in-fade">
            <PillarsGuideTab score={score} />
          </TabsContent>

          <TabsContent value="classification" className="animate-in-fade">
            <ClassificationGuideTab />
          </TabsContent>

          <TabsContent value="status" className="animate-in-fade">
            <StatusGuideTab />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export function FinancialScoreDashboard() {
  const [data, setData] = useState<ScoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMonthLoading, setIsMonthLoading] = useState(false);
  const [config, setConfig] = useState<EnvelopeConfig>({
    essentialsPct: 50,
    leisurePct: 30,
    investmentsPct: 20,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadInitialData() {
      const result = await getFinancialScoreDataAction();
      if (cancelled) return;

      if (!result.success) {
        toast.error(result.error);
        setLoading(false);
        return;
      }

      setData(result.data);
      setLoading(false);
    }

    void loadInitialData();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleMonthChange(monthRef: string) {
    if (!data || monthRef === data.selectedMonth) return;

    setIsMonthLoading(true);
    const result = await getFinancialScoreDataAction({ monthRef });

    if (!result.success) {
      toast.error(result.error);
      setIsMonthLoading(false);
      return;
    }

    setData(result.data);
    setIsMonthLoading(false);
  }

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
  const currentStatusMeta = didacticStatusMeta(envelope.status);

  return (
    <div className="animate-stagger space-y-6">
      <Card className="relative overflow-hidden border-none bg-gradient-to-br from-sky-700 via-cyan-600 to-emerald-500 text-white shadow-xl">
        <div className="absolute -left-14 -top-16 h-44 w-44 rounded-full bg-white/20 blur-2xl" />
        <div className="absolute -bottom-12 -right-10 h-40 w-40 rounded-full bg-emerald-200/40 blur-2xl" />
        <CardContent className="relative grid gap-6 p-6 md:grid-cols-[auto_1fr] md:items-center md:p-8">
          <ScoreRing score={data.score.overallScore} />
          <div className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-white/75">
                  Financial Intelligence
                </p>
                <h2 className="mt-1 text-3xl font-black tracking-tight">Seu Score Financeiro</h2>
              </div>

              <div className="w-full md:w-[220px]">
                <Select value={data.selectedMonth} onValueChange={handleMonthChange}>
                  <SelectTrigger className="border-white/30 bg-white/10 text-white">
                    <SelectValue placeholder="Selecionar mês" />
                  </SelectTrigger>
                  <SelectContent>
                    {data.availableMonths.map((monthRef) => (
                      <SelectItem key={monthRef} value={monthRef}>
                        {formatMonthRef(monthRef)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-white/20 text-white hover:bg-white/25">
                Mês {formatMonthRef(data.selectedMonth)}
              </Badge>
              <Badge className="bg-white/20 text-white hover:bg-white/25">{tone.label}</Badge>
              <Badge className="bg-white/20 text-white hover:bg-white/25">
                Saldo projetado {formatCurrency(data.snapshot.projectedEndOfMonthBalance)}
              </Badge>
              <Badge className="bg-white/20 text-white hover:bg-white/25">
                {currentStatusMeta.label}
              </Badge>
              {isMonthLoading && (
                <Badge className="bg-white/20 text-white hover:bg-white/25">
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Atualizando
                </Badge>
              )}
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

            <div className="flex items-center justify-between rounded-md border border-muted/70 bg-muted/30 px-3 py-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                Situação atual do envelope
              </div>
              <EnvelopeStatusChip status={envelope.status} />
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

      <ScoreHelpCenter score={data.score} />

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
              data.snapshot.topCategories.map((category) => {
                const iconDefinition = getCategoryIconDefinition(category.categoryIcon);
                const Icon = iconDefinition.Icon;

                return (
                  <div key={category.categoryId} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-muted">
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        {category.categoryName}
                      </span>
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
                );
              })
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <PiggyBank className="h-5 w-5" />
              Real x Meta por Bloco
            </CardTitle>
            <CardDescription>
              Real usa renda do mês; sem renda, usa distribuição dos gastos registrados.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Essenciais", data: envelope.essentials },
              { label: "Estilo de vida", data: envelope.leisure },
              { label: "Investimentos", data: envelope.investments },
            ].map((bucket) => {
              const statusMeta = didacticStatusMeta(bucket.data.status);

              return (
                <div key={bucket.label} className="space-y-1 rounded-xl border p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>{bucket.label}</span>
                    <div className="flex items-center gap-2">
                      <EnvelopeStatusChip status={bucket.data.status} />
                      <span className="font-medium">
                        Real {bucket.data.actualPct.toFixed(1)}% | Meta{" "}
                        {bucket.data.targetPct.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className={`h-2 rounded-full ${bucketBarColor(bucket.data.status)}`}
                      style={{
                        width:
                          bucket.data.actualPct > 0
                            ? `${Math.max(6, Math.min(bucket.data.actualPct, 100))}%`
                            : "0%",
                      }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {statusMeta.description} | Real: {formatCurrency(bucket.data.amount)} |
                    Diferença: {bucket.data.differencePct.toFixed(1)} p.p.
                  </div>
                </div>
              );
            })}
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
                  className="flex flex-col gap-3 rounded-xl border p-4 md:flex-row md:items-center md:justify-between"
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
