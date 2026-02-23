import type { Metadata } from "next";
import { FinancialScoreDashboard } from "@/features/score";

export const metadata: Metadata = {
  title: "Score Financeiro | FinPlanner",
  description: "Monitore seu score financeiro, envelope digital e riscos estruturais.",
};

export default function ScorePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Score Financeiro</h1>
        <p className="text-muted-foreground">
          Leia seu momento financeiro com um cockpit estratégico e ajustável.
        </p>
      </div>

      <FinancialScoreDashboard />
    </div>
  );
}
