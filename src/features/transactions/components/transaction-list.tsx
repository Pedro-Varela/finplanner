"use client";

import Link from "next/link";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ListOrdered,
  Plus,
  Tag,
  TrendingDown,
  TrendingUp,
  Upload,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Transaction, Category, TransactionFilters } from "@/core/entities";
import { CategoryChip } from "@/components/category-chip";
import { listTransactionsAction, listCategoriesAction } from "../actions";
import { TransactionForm } from "./transaction-form";
import { DeleteTransactionDialog } from "./delete-transaction-dialog";
import { CategorizeTransactionDialog } from "./categorize-transaction-dialog";
import { TransactionFiltersBar } from "./transaction-filters";

const PAGE_SIZE_OPTIONS = [10, 20, 50];

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
  const filtersRef = useRef<TransactionFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  const [formOpen, setFormOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingTx, setDeletingTx] = useState<Transaction | null>(null);

  const [categorizeOpen, setCategorizeOpen] = useState(false);
  const [categorizingTx, setCategorizingTx] = useState<Transaction | null>(null);

  const load = useCallback((filters?: TransactionFilters) => {
    startTransition(async () => {
      const [txRes, catRes] = await Promise.all([
        listTransactionsAction(filters),
        listCategoriesAction(),
      ]);
      if (txRes.success) setTransactions(txRes.data);
      else toast.error(txRes.error);

      if (catRes.success) setCategories(catRes.data);
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const totalPages = Math.max(1, Math.ceil(transactions.length / pageSize));
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return transactions.slice(start, start + pageSize);
  }, [currentPage, pageSize, transactions]);
  const totalIncome = useMemo(
    () =>
      transactions
        .filter((transaction) => transaction.type === "income")
        .reduce((acc, transaction) => acc + transaction.amount, 0),
    [transactions]
  );
  const totalExpense = useMemo(
    () =>
      transactions
        .filter((transaction) => transaction.type === "expense")
        .reduce((acc, transaction) => acc + transaction.amount, 0),
    [transactions]
  );
  const balance = totalIncome - totalExpense;
  const fromItem = transactions.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const toItem = Math.min(currentPage * pageSize, transactions.length);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  function handleFiltersChange(filters: TransactionFilters) {
    filtersRef.current = filters;
    setCurrentPage(1);
    load(filters);
  }

  function handleNew() {
    setEditingTx(null);
    setFormOpen(true);
  }

  function handleEdit(tx: Transaction) {
    setEditingTx(tx);
    setFormOpen(true);
  }

  function handleDelete(tx: Transaction) {
    setDeletingTx(tx);
    setDeleteOpen(true);
  }

  function handleCategorize(tx: Transaction) {
    setCategorizingTx(tx);
    setCategorizeOpen(true);
  }

  return (
    <div className="animate-stagger space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transações</h1>
          <p className="text-muted-foreground">Gerencie suas receitas e despesas.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2" asChild>
            <Link href="/transactions/import">
              <Upload className="h-4 w-4" />
              Importar CSV
            </Link>
          </Button>
          <Button onClick={handleNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Nova transação
          </Button>
        </div>
      </div>

      <TransactionFiltersBar categories={categories} onFiltersChange={handleFiltersChange} />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalIncome)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-500">{formatCurrency(totalExpense)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saldo</CardTitle>
            <Wallet className={`h-4 w-4 ${balance >= 0 ? "text-emerald-600" : "text-red-500"}`} />
          </CardHeader>
          <CardContent>
            <p
              className={`text-2xl font-bold ${balance >= 0 ? "text-emerald-600" : "text-red-500"}`}
            >
              {formatCurrency(balance)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Itens filtrados
            </CardTitle>
            <ListOrdered className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{transactions.length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
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
              paginatedTransactions.map((tx) => {
                const cat = categoryMap.get(tx.categoryId);
                return (
                  <TableRow key={tx.id}>
                    <TableCell className="font-medium">{tx.title}</TableCell>
                    <TableCell>
                      {cat ? (
                        <CategoryChip name={cat.name} icon={cat.icon} type={cat.type} />
                      ) : (
                        <button
                          onClick={() => handleCategorize(tx)}
                          className="inline-flex items-center gap-1 rounded-md border border-dashed border-muted-foreground/30 px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
                        >
                          <Tag className="h-3 w-3" />
                          Categorizar
                        </button>
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
                            <span className="sr-only">Ações</span>···
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {!cat && (
                            <DropdownMenuItem onClick={() => handleCategorize(tx)}>
                              Categorizar
                            </DropdownMenuItem>
                          )}
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

      <div className="flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-muted-foreground">
          Mostrando <span className="font-medium text-foreground">{fromItem}</span>-
          <span className="font-medium text-foreground">{toItem}</span> de{" "}
          <span className="font-medium text-foreground">{transactions.length}</span> transações
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={String(pageSize)}
            onValueChange={(value) => {
              setPageSize(Number(value));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[132px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option} por página
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          <span className="min-w-20 text-center text-sm text-muted-foreground">
            Página {currentPage}/{totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            disabled={currentPage === totalPages}
          >
            Próxima
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <TransactionForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={() => load(filtersRef.current)}
        transaction={editingTx}
      />

      <DeleteTransactionDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onSuccess={() => load(filtersRef.current)}
        transaction={deletingTx}
      />

      <CategorizeTransactionDialog
        open={categorizeOpen}
        onOpenChange={setCategorizeOpen}
        onSuccess={() => load(filtersRef.current)}
        transaction={categorizingTx}
      />
    </div>
  );
}
