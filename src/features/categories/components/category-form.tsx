"use client";

import { useEffect, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { Category } from "@/core/entities";
import { categorySchema, type CategoryFormValues } from "../schemas";
import { createCategoryAction, updateCategoryAction } from "../actions";

const PRESET_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#10b981",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f43f5e",
  "#64748b",
];

interface CategoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  category?: Category | null;
}

export function CategoryForm({ open, onOpenChange, onSuccess, category }: CategoryFormProps) {
  const isEdit = !!category;
  const [isPending, startTransition] = useTransition();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      color: PRESET_COLORS[0],
      icon: "",
    },
  });

  useEffect(() => {
    if (open && category) {
      form.reset({
        name: category.name,
        color: category.color,
        icon: category.icon ?? "",
      });
    } else if (open) {
      form.reset({
        name: "",
        color: PRESET_COLORS[0],
        icon: "",
      });
    }
  }, [open, category, form]);

  function onSubmit(values: CategoryFormValues) {
    startTransition(async () => {
      const result = isEdit
        ? await updateCategoryAction(category!.id, values)
        : await createCategoryAction(values);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success(isEdit ? "Categoria atualizada." : "Categoria criada.");
      onOpenChange(false);
      onSuccess();
    });
  }

  const selectedColor = form.watch("color");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar categoria" : "Nova categoria"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Alimentação, Transporte..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cor</FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${
                          selectedColor === color
                            ? "border-foreground scale-110"
                            : "border-transparent"
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => field.onChange(color)}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="#RRGGBB"
                        className="w-28 font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    <div
                      className="h-8 w-8 rounded-full border"
                      style={{ backgroundColor: field.value }}
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ícone (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: 🍔, 🚗, 💰..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Salvando..." : isEdit ? "Salvar" : "Criar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
