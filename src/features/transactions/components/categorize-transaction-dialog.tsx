"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { Transaction, Category } from "@/core/entities";
import { getCategoryIconDefinition } from "@/lib/category-icons";
import { categorizeTransactionAction, listCategoriesAction } from "../actions";

interface CategorizeTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  transaction: Transaction | null;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(iso + "T00:00:00"));
}

export function CategorizeTransactionDialog({
  open,
  onOpenChange,
  onSuccess,
  transaction,
}: CategorizeTransactionDialogProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [createRule, setCreateRule] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (open) {
      setSelectedCategoryId("");
      setCreateRule(false);
      listCategoriesAction().then((res) => {
        if (res.success) setCategories(res.data);
      });
    }
  }, [open]);

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const selectedCategoryIcon = selectedCategory
    ? getCategoryIconDefinition(selectedCategory.icon)
    : null;
  const SelectedCategoryIcon = selectedCategoryIcon?.Icon;

  function handleSave() {
    if (!transaction || !selectedCategoryId) return;

    startTransition(async () => {
      const result = await categorizeTransactionAction(
        transaction.id,
        selectedCategoryId,
        createRule
      );

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      const messages = ["Transação categorizada."];
      if (result.data.ruleCreated) {
        messages.push("Regra criada para descrições semelhantes.");
      }
      toast.success(messages.join(" "));
      onOpenChange(false);
      onSuccess();
    });
  }

  if (!transaction) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Categorizar transação</DialogTitle>
          <DialogDescription>Selecione uma categoria para esta transação.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Transaction summary */}
          <div className="rounded-lg border bg-muted/50 p-3">
            <p className="font-medium">{transaction.title}</p>
            <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
              <span>{formatDate(transaction.date)}</span>
              <span
                className={`font-medium ${
                  transaction.type === "income" ? "text-emerald-600" : "text-red-500"
                }`}
              >
                {transaction.type === "income" ? "+" : "−"} {formatCurrency(transaction.amount)}
              </span>
            </div>
          </div>

          {/* Category select */}
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select onValueChange={setSelectedCategoryId} value={selectedCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => {
                  const iconDefinition = getCategoryIconDefinition(cat.icon);
                  const Icon = iconDefinition.Icon;

                  return (
                    <SelectItem key={cat.id} value={cat.id}>
                      <span className="flex items-center gap-2">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-muted">
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        {cat.name}
                        <Badge
                          variant="outline"
                          className={`text-xs ${cat.type === "income" ? "text-emerald-600 border-emerald-300" : "text-red-500 border-red-300"}`}
                        >
                          {cat.type === "income" ? "Receita" : "Despesa"}
                        </Badge>
                      </span>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {selectedCategory && (
              <p className="text-xs text-muted-foreground">
                {SelectedCategoryIcon && (
                  <SelectedCategoryIcon className="mr-1 inline h-3.5 w-3.5 align-text-bottom" />
                )}
                Tipo:{" "}
                <span
                  className={
                    selectedCategory.type === "income" ? "text-emerald-600" : "text-red-500"
                  }
                >
                  {selectedCategory.type === "income" ? "Receita" : "Despesa"}
                </span>{" "}
                (herdado da categoria)
              </p>
            )}
          </div>

          {/* Auto-rule toggle */}
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
            <input
              type="checkbox"
              checked={createRule}
              onChange={(e) => setCreateRule(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-input accent-primary"
            />
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium">
                  Aplicar automaticamente para descrições semelhantes
                </span>
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              </div>
              <p className="text-xs text-muted-foreground">
                Cria uma regra que categoriza automaticamente transações futuras com descrições
                parecidas.
              </p>
            </div>
          </label>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={isPending || !selectedCategoryId}>
              {isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
