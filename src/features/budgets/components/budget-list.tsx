"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { BudgetProgress, Category } from "@/core/entities";
import { getBudgetProgressAction, setBudgetAction, deleteBudgetAction } from "../actions";
import { listCategoriesAction } from "@/features/categories/actions";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function BudgetList() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [progress, setProgress] = useState<BudgetProgress[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, startTransition] = useTransition();
  const [formOpen, setFormOpen] = useState(false);
  const [newCatId, setNewCatId] = useState("");
  const [newAmount, setNewAmount] = useState("");

  const load = useCallback(() => {
    startTransition(async () => {
      const [bRes, cRes] = await Promise.all([
        getBudgetProgressAction(month, year),
        listCategoriesAction(),
      ]);
      if (bRes.success) setProgress(bRes.data);
      else toast.error(bRes.error);
      if (cRes.success) setCategories(cRes.data.filter((c) => c.type === "expense"));
    });
  }, [month, year]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate() {
    if (!newCatId || !newAmount) return;
    const result = await setBudgetAction({
      categoryId: newCatId,
      amount: parseFloat(newAmount),
      month,
      year,
    });
    if (result.success) {
      toast.success("Orçamento definido.");
      setFormOpen(false);
      setNewCatId("");
      setNewAmount("");
      load();
    } else {
      toast.error(result.error);
    }
  }

  async function handleDelete(id: string) {
    const result = await deleteBudgetAction(id);
    if (result.success) {
      toast.success("Orçamento removido.");
      load();
    } else {
      toast.error(result.error);
    }
  }

  const monthNames = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orçamentos</h1>
          <p className="text-muted-foreground">Defina limites mensais por categoria.</p>
        </div>
        <Button onClick={() => setFormOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo orçamento
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {monthNames.map((m, i) => (
              <SelectItem key={i} value={String(i + 1)}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[year - 1, year, year + 1].map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading && progress.length === 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl border bg-muted/40" />
          ))}
        </div>
      ) : progress.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Nenhum orçamento definido para {monthNames[month - 1]} {year}.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {progress.map((p) => {
            const overBudget = p.percentage > 100;
            const warning = p.percentage >= 80 && !overBudget;
            return (
              <Card key={p.budget.id}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">{p.categoryName}</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(p.budget.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>
                      {formatCurrency(p.spent)} / {formatCurrency(p.budget.amount)}
                    </span>
                    <span
                      className={
                        overBudget
                          ? "font-semibold text-red-500"
                          : warning
                            ? "text-amber-500"
                            : "text-emerald-600"
                      }
                    >
                      {p.percentage.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all ${
                        overBudget ? "bg-red-500" : warning ? "bg-amber-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${Math.min(p.percentage, 100)}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Definir orçamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Categoria</label>
              <Select value={newCatId} onValueChange={setNewCatId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Limite (R$)</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setFormOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreate} disabled={!newCatId || !newAmount}>
                Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
