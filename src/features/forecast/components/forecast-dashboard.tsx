"use client";

import { useEffect, useState } from "react";
import { getForecastAction } from "../actions";
import type { ForecastData, ForecastScenarioType } from "@/core/entities/forecast";
import { ForecastChart } from "./forecast-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";


export function ForecastDashboard() {
    const [data, setData] = useState<ForecastData | null>(null);
    const [loading, setLoading] = useState(true);
    const [months, setMonths] = useState<6 | 12>(6);
    const [scenario, setScenario] = useState<ForecastScenarioType>("realistic");

    useEffect(() => {
        async function fetchForecast() {
            setLoading(true);
            const res = await getForecastAction(months);
            if (res.success) {
                setData(res.data);
            }
            setLoading(false);
        }
        fetchForecast();
    }, [months]);

    if (loading || !data) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                Calculando projeções baseadas no seu histórico...
            </div>
        );
    }

    const currentScenarioData = data.scenarios[scenario];
    const finalMonth = currentScenarioData[currentScenarioData.length - 1];
    const finalBalance = finalMonth.accumulatedBalance;

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Média Histórica (Receita)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-500">
                            {formatCurrency(data.baselineAverageIncome)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Média Histórica (Despesa)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">
                            {formatCurrency(data.baselineAverageExpense)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Previsão Saldo (Mês {months})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(finalBalance)}</div>
                        <p className="text-xs text-muted-foreground mt-1 text-blue-500">
                            Cenário:{" "}
                            {scenario === "pessimistic"
                                ? "Pessimista"
                                : scenario === "realistic"
                                    ? "Realista"
                                    : "Otimista"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <Tabs
                    defaultValue="realistic"
                    onValueChange={(v: string) => setScenario(v as ForecastScenarioType)}
                >
                    <TabsList>
                        <TabsTrigger value="pessimistic">Pessimista (-5% R / +10% D)</TabsTrigger>
                        <TabsTrigger value="realistic">Realista (Média)</TabsTrigger>
                        <TabsTrigger value="optimistic">Otimista (+5% R / -5% D)</TabsTrigger>
                    </TabsList>
                </Tabs>

                <Select
                    value={months.toString()}
                    onValueChange={(v: string) => setMonths(Number(v) as 6 | 12)}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Período" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="6">Próximos 6 meses</SelectItem>
                        <SelectItem value="12">Próximos 12 meses</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Projeção de Evolução Patrimonial</CardTitle>
                    <CardDescription>
                        Estimativa de receitas, despesas e saldo acumulado por mês.
                    </CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                    <ForecastChart data={currentScenarioData} />
                </CardContent>
            </Card>
        </div>
    );
}
