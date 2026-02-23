import { Metadata } from "next";
import { ForecastDashboard } from "@/features/forecast/components/forecast-dashboard";

export const metadata: Metadata = {
  title: "Forecast & Projeções | FinPlanner",
  description: "Previsões financeiras baseadas no seu histórico.",
};

export default function ForecastPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Forecast Financeiro</h2>
      </div>
      <ForecastDashboard />
    </div>
  );
}
