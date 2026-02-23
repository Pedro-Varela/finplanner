"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { ArrowDownUp, Plus, Sparkles, Tags } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
import type { Category } from "@/core/entities";
import { CategoryChip } from "@/components/category-chip";
import { listCategoriesAction } from "../actions";
import { CategoryForm } from "./category-form";
import { DeleteCategoryDialog } from "./delete-category-dialog";

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(iso));
}

export function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, startTransition] = useTransition();

  const [formOpen, setFormOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingCat, setDeletingCat] = useState<Category | null>(null);

  const load = useCallback(() => {
    startTransition(async () => {
      const result = await listCategoriesAction();
      if (result.success) setCategories(result.data);
      else toast.error(result.error);
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const totals = useMemo(() => {
    const income = categories.filter((category) => category.type === "income").length;
    const expense = categories.filter((category) => category.type === "expense").length;
    return {
      total: categories.length,
      income,
      expense,
    };
  }, [categories]);

  function handleNew() {
    setEditingCat(null);
    setFormOpen(true);
  }

  function handleEdit(cat: Category) {
    setEditingCat(cat);
    setFormOpen(true);
  }

  function handleDelete(cat: Category) {
    setDeletingCat(cat);
    setDeleteOpen(true);
  }

  return (
    <div className="animate-stagger space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categorias</h1>
          <p className="text-muted-foreground">
            Organize seus lançamentos com ícones para leitura mais rápida em todo o sistema.
          </p>
        </div>
        <Button onClick={handleNew} className="gap-2 shadow-sm">
          <Plus className="h-4 w-4" />
          Nova categoria
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="border-sky-200/60 bg-gradient-to-br from-sky-50 to-cyan-50 dark:border-sky-900/60 dark:from-sky-950/30 dark:to-cyan-950/20">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Total</p>
              <p className="text-2xl font-black">{totals.total}</p>
            </div>
            <Tags className="h-5 w-5 text-sky-500" />
          </CardContent>
        </Card>
        <Card className="border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-teal-50 dark:border-emerald-900/60 dark:from-emerald-950/30 dark:to-teal-950/20">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Receitas</p>
              <p className="text-2xl font-black text-emerald-600">{totals.income}</p>
            </div>
            <ArrowDownUp className="h-5 w-5 text-emerald-500" />
          </CardContent>
        </Card>
        <Card className="border-violet-200/60 bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:border-violet-900/60 dark:from-violet-950/30 dark:to-fuchsia-950/20">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Despesas</p>
              <p className="text-2xl font-black text-violet-700 dark:text-violet-300">
                {totals.expense}
              </p>
            </div>
            <Sparkles className="h-5 w-5 text-violet-500" />
          </CardContent>
        </Card>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Categoria</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Criada em</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  Carregando categorias...
                </TableCell>
              </TableRow>
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  Nenhuma categoria encontrada. Crie a primeira para começar.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((cat) => (
                <TableRow
                  key={cat.id}
                  className="transition-colors hover:bg-muted/40 data-[state=selected]:bg-muted/40"
                >
                  <TableCell>
                    <CategoryChip name={cat.name} icon={cat.icon} type={cat.type} />
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={cat.type === "income" ? "default" : "secondary"}
                      className={
                        cat.type === "income"
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400"
                          : "bg-rose-100 text-rose-700 hover:bg-rose-100 dark:bg-rose-950 dark:text-rose-400"
                      }
                    >
                      {cat.type === "income" ? "Receita" : "Despesa"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(cat.createdAt)}
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
                        <DropdownMenuItem onClick={() => handleEdit(cat)}>Editar</DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(cat)}
                          className="text-destructive focus:text-destructive"
                        >
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <CategoryForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={load}
        category={editingCat}
      />

      <DeleteCategoryDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onSuccess={load}
        category={deletingCat}
      />
    </div>
  );
}
