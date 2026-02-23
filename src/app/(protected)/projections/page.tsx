import { ProjectionsDashboard } from "@/features/projections";

export const metadata = {
  title: "Projeções e Tendências | FinPlanner",
  description: "Visualize projeções de faturas e tendências de gastos.",
};

export default function ProjectionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Projeções e Tendências</h1>
        <p className="text-muted-foreground">
          Acompanhe o ritmo dos seus gastos e preveja sua próxima fatura.
        </p>
      </div>
      <ProjectionsDashboard />
    </div>
  );
}
