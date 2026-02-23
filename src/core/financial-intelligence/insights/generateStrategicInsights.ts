import type {
  EnvelopeStatus,
  FinancialScore,
  FinancialSnapshot,
  StrategicInsight,
  StrategicInsightSeverity,
} from "../types";

function buildInsight(
  monthRef: string,
  type: StrategicInsight["type"],
  severity: StrategicInsightSeverity,
  title: string,
  description: string
): StrategicInsight {
  return {
    id: `${monthRef}:${type}`,
    type,
    severity,
    title,
    description,
  };
}

function severityOrder(severity: StrategicInsightSeverity): number {
  if (severity === "critical") return 4;
  if (severity === "high") return 3;
  if (severity === "medium") return 2;
  return 1;
}

export function generateStrategicInsights(
  snapshot: FinancialSnapshot,
  score: FinancialScore,
  envelope: EnvelopeStatus
): StrategicInsight[] {
  const insights: StrategicInsight[] = [];

  const costRate =
    snapshot.totalIncome > 0 ? (snapshot.totalExpense / snapshot.totalIncome) * 100 : 0;
  if (costRate >= 90) {
    insights.push(
      buildInsight(
        snapshot.monthRef,
        "high_cost_structure",
        costRate >= 100 ? "critical" : "high",
        "Estrutura de custo elevada",
        `As despesas consumiram ${costRate.toFixed(1)}% da renda mensal. Revise custos fixos para recuperar margem.`
      )
    );
  }

  if (snapshot.projectedEndOfMonthBalance < 0) {
    insights.push(
      buildInsight(
        snapshot.monthRef,
        "negative_balance_risk",
        snapshot.projectedEndOfMonthBalance < -snapshot.totalIncome * 0.15 ? "critical" : "high",
        "Risco de saldo negativo",
        `A projeção de fechamento do mês está em ${snapshot.projectedEndOfMonthBalance.toFixed(2)}.`
      )
    );
  }

  if (snapshot.savingsRate < 10) {
    insights.push(
      buildInsight(
        snapshot.monthRef,
        "low_savings",
        snapshot.savingsRate < 0 ? "high" : "medium",
        "Taxa de poupança baixa",
        `A taxa de poupança está em ${snapshot.savingsRate.toFixed(1)}%. O recomendado é manter pelo menos 20%.`
      )
    );
  }

  if (snapshot.expenseConcentrationRate >= 35) {
    const topCategory = snapshot.topCategories[0];
    insights.push(
      buildInsight(
        snapshot.monthRef,
        "category_dependency",
        snapshot.expenseConcentrationRate >= 50 ? "high" : "medium",
        "Dependência excessiva de categoria",
        `${topCategory?.categoryName ?? "Uma categoria"} representa ${snapshot.expenseConcentrationRate.toFixed(1)}% das despesas do mês.`
      )
    );
  }

  if (snapshot.monthlyExpenseTrendRate >= 15) {
    insights.push(
      buildInsight(
        snapshot.monthRef,
        "growing_expense_trend",
        snapshot.monthlyExpenseTrendRate >= 30 ? "high" : "medium",
        "Tendência de gastos em alta",
        `As despesas cresceram ${snapshot.monthlyExpenseTrendRate.toFixed(1)}% em relação ao mês anterior.`
      )
    );
  }

  if (score.overallScore < 50 && envelope.status !== "ok") {
    insights.push(
      buildInsight(
        snapshot.monthRef,
        "high_cost_structure",
        "medium",
        "Desalinhamento estrutural do orçamento",
        "Score financeiro baixo e envelope fora da meta indicam necessidade de ajuste imediato nas prioridades de gasto."
      )
    );
  }

  return insights.sort((a, b) => severityOrder(b.severity) - severityOrder(a.severity));
}
