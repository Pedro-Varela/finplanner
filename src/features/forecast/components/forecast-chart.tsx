"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MonthlyForecast } from "@/core/entities/forecast";
import { formatCurrency } from "@/lib/utils";

interface ForecastChartProps {
  data: MonthlyForecast[];
}

export function ForecastChart({ data }: ForecastChartProps) {
  // Format monthYear strings for better display
  const chartData = data.map((d) => ({
    ...d,
    formattedMonth: d.monthYear.substring(5) + "/" + d.monthYear.substring(2, 4), // MM/YY
  }));

  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3 text-sm">
          <p className="font-semibold mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 mb-1">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: entry.color || entry.stroke }}
              />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-medium">{formatCurrency(entry.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
        <XAxis
          dataKey="formattedMonth"
          tickLine={false}
          axisLine={false}
          className="text-xs text-muted-foreground"
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `€${value}`}
          className="text-xs text-muted-foreground"
        />
        <Tooltip content={customTooltip} cursor={{ fill: "rgba(0,0,0,0.05)" }} />
        <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "20px" }} />

        <Bar
          dataKey="expectedIncome"
          name="Receitas Previsíveis"
          fill="#10b981"
          radius={[4, 4, 0, 0]}
          barSize={30}
        />
        <Bar
          dataKey="expectedExpense"
          name="Despesas Previsíveis"
          fill="#ef4444"
          radius={[4, 4, 0, 0]}
          barSize={30}
        />
        <Line
          type="monotone"
          dataKey="accumulatedBalance"
          name="Saldo Acumulado"
          stroke="#3b82f6"
          strokeWidth={3}
          dot={{ r: 4, fill: "#3b82f6", strokeWidth: 2, stroke: "var(--background)" }}
          activeDot={{ r: 6 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
