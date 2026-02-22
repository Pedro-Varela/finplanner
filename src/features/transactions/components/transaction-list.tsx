"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Transaction, Category } from "@/core/entities";
import { listTransactionsAction, listCategoriesAction } from "../actions";
import { TransactionForm } from "./transaction-form";
import { DeleteTransactionDialog } from "./delete-transaction-dialog";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(iso + "T00:00:00"));
}

export function TransactionList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, startTransition] = useTransition();

  const [formOpen, setFormOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingTx, setDeletingTx] = useState<Transaction | null>(null);

  const load = useCallback(() => {
    startTransition(async () => {
      const [txRes, catRes] = await Promise.all([listTransactionsAction(), listCategoriesAction()]);
      if (txRes.success) setTransactions(txRes.data);
      else toast.error(txRes.error);

      if (catRes.success) setCategories(catRes.data);
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  function handleEdit(tx: Transaction) {
    setEditingTx(tx);
    setFormOpen(true);
  }

  function handleDelete(tx: Transaction) {
    setDeletingTx(tx);
    setDeleteOpen(true);
  }

  function handleNew() {
    setEditingTx(null);
    setFormOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transações</h1>
          <p className="text-muted-foreground">Gerencie suas receitas e despesas.</p>
        </div>
        <Button onClick={handleNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova transação
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Nenhuma transação encontrada.
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((tx) => {
                const cat = categoryMap.get(tx.categoryId);
                return (
                  <TableRow key={tx.id}>
                    <TableCell className="font-medium">{tx.description}</TableCell>
                    <TableCell>
                      {cat ? (
                        <Badge variant="outline" className="gap-1">
                          <span
                            className="inline-block h-2 w-2 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          {cat.name}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(tx.date)}</TableCell>
                    <TableCell
                      className={`text-right font-medium ${
                        tx.type === "income" ? "text-emerald-600" : "text-red-500"
                      }`}
                    >
                      {tx.type === "income" ? "+" : "−"} {formatCurrency(tx.amount)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <span className="sr-only">Ações</span>
                            ···
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(tx)}>Editar</DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(tx)}
                            className="text-destructive focus:text-destructive"
                          >
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <TransactionForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={load}
        transaction={editingTx}
      />

      <DeleteTransactionDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onSuccess={load}
        transaction={deletingTx}
      />
    </div>
  );
}
