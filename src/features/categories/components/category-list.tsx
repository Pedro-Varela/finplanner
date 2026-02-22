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
import type { Category } from "@/core/entities";
import { listCategoriesAction } from "../actions";
import { CategoryForm } from "./category-form";
import { DeleteCategoryDialog } from "./delete-category-dialog";

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categorias</h1>
          <p className="text-muted-foreground">Organize suas transações por categorias.</p>
        </div>
        <Button onClick={handleNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova categoria
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                  Nenhuma categoria encontrada. Crie a primeira!
                </TableCell>
              </TableRow>
            ) : (
              categories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant={cat.type === "income" ? "default" : "secondary"}
                      className={
                        cat.type === "income"
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400"
                          : "bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-400"
                      }
                    >
                      {cat.type === "income" ? "Receita" : "Despesa"}
                    </Badge>
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
