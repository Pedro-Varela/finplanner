"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Plus, Pause, Play, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { RecurringTransaction, Category } from "@/core/entities";
import {
  listRecurringAction,
  createRecurringAction,
  toggleRecurringAction,
  deleteRecurringAction,
} from "../actions";
import { listCategoriesAction } from "@/features/categories/actions";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

const FREQ_LABELS: Record<string, string> = {
  weekly: "Semanal",
  monthly: "Mensal",
  yearly: "Anual",
};

export function RecurringList() {
  const [items, setItems] = useState<RecurringTransaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, startTransition] = useTransition();
  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [catId, setCatId] = useState("");
  const [freq, setFreq] = useState("monthly");
  const [nextDate, setNextDate] = useState(new Date().toISOString().slice(0, 10));

  const load = useCallback(() => {
    startTransition(async () => {
      const [rRes, cRes] = await Promise.all([listRecurringAction(), listCategoriesAction()]);
      if (rRes.success) setItems(rRes.data);
      else toast.error(rRes.error);
      if (cRes.success) setCategories(cRes.data);
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const catMap = new Map(categories.map((c) => [c.id, c]));

  async function handleCreate() {
    if (!title || !amount || !catId) return;
    const result = await createRecurringAction({
      title,
      amount: parseFloat(amount),
      categoryId: catId,
      frequency: freq,
      nextDate,
    });
    if (result.success) {
      toast.success("Recorrência criada.");
      setFormOpen(false);
      setTitle("");
      setAmount("");
      setCatId("");
      load();
    } else {
      toast.error(result.error);
    }
  }

  async function handleToggle(item: RecurringTransaction) {
    const result = await toggleRecurringAction(item.id, !item.active);
    if (result.success) {
      toast.success(item.active ? "Recorrência pausada." : "Recorrência ativada.");
      load();
    } else {
      toast.error(result.error);
    }
  }

  async function handleDelete(id: string) {
    const result = await deleteRecurringAction(id);
    if (result.success) {
      toast.success("Recorrência removida.");
      load();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Recorrências</h1>
          <p className="text-muted-foreground">Transações automáticas periódicas.</p>
        </div>
        <Button onClick={() => setFormOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova recorrência
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Frequência</TableHead>
              <TableHead>Próxima data</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="w-24">Status</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  Nenhuma recorrência configurada.
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => {
                const cat = catMap.get(item.categoryId);
                return (
                  <TableRow key={item.id} className={!item.active ? "opacity-50" : ""}>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>{cat?.name ?? "—"}</TableCell>
                    <TableCell>{FREQ_LABELS[item.frequency]}</TableCell>
                    <TableCell>{item.nextDate}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.amount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.active ? "default" : "secondary"}>
                        {item.active ? "Ativa" : "Pausada"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleToggle(item)}
                        >
                          {item.active ? (
                            <Pause className="h-3.5 w-3.5" />
                          ) : (
                            <Play className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova recorrência</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Título</label>
              <Input
                placeholder="Ex: Aluguel, Netflix..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Valor (R$)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Frequência</label>
                <Select value={freq} onValueChange={setFreq}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                    <SelectItem value="yearly">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Categoria</label>
                <Select value={catId} onValueChange={setCatId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Próxima data</label>
                <Input type="date" value={nextDate} onChange={(e) => setNextDate(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setFormOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreate} disabled={!title || !amount || !catId}>
                Criar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
