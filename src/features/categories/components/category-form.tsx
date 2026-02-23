"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEFAULT_CATEGORY_ICON, type Category } from "@/core/entities";
import {
  CATEGORY_FAMILY_LABELS,
  suggestCategoryIconFromName,
} from "@/core/categories/category-taxonomy";
import { getCategoryIconDefinition } from "@/lib/category-icons";
import { categorySchema, type CategoryFormValues } from "../schemas";
import { createCategoryAction, updateCategoryAction } from "../actions";
import { CategoryIconPicker } from "./category-icon-picker";

interface CategoryFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  category?: Category | null;
}

export function CategoryForm({ open, onOpenChange, onSuccess, category }: CategoryFormProps) {
  const isEdit = !!category;
  const [isPending, startTransition] = useTransition();
  const [dismissedSuggestion, setDismissedSuggestion] = useState<string | null>(null);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      type: "expense",
      icon: DEFAULT_CATEGORY_ICON,
    },
  });

  useEffect(() => {
    if (open && category) {
      form.reset({
        name: category.name,
        type: category.type,
        icon: category.icon,
      });
    } else if (open) {
      form.reset({
        name: "",
        type: "expense",
        icon: DEFAULT_CATEGORY_ICON,
      });
    }
  }, [open, category, form]);

  useEffect(() => {
    if (open) {
      setDismissedSuggestion(null);
    }
  }, [open, category?.id]);

  const nameValue = form.watch("name");
  const iconValue = form.watch("icon");
  const iconSuggestion = useMemo(() => suggestCategoryIconFromName(nameValue), [nameValue]);
  const suggestionKey = iconSuggestion ? `${nameValue}:${iconSuggestion.icon}` : null;
  const shouldShowSuggestion =
    iconSuggestion &&
    iconSuggestion.icon !== iconValue &&
    suggestionKey !== dismissedSuggestion &&
    nameValue.trim().length >= 3;
  const suggestedIcon = iconSuggestion ? getCategoryIconDefinition(iconSuggestion.icon) : null;

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            {isEdit ? "Editar categoria" : "Nova categoria"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Defina nome, tipo e um ícone para facilitar leitura no dashboard e nas transações.
          </p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
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

            {shouldShowSuggestion && iconSuggestion && suggestedIcon && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3 dark:border-amber-900/60 dark:bg-amber-950/20">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    Sugestão automática de ícone
                  </p>
                  <Badge
                    variant="outline"
                    className="border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-300"
                  >
                    Confiança {iconSuggestion.confidence === "high" ? "alta" : "média"}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-amber-800/90 dark:text-amber-300/90">
                  Pelo termo{" "}
                  <span className="font-semibold">&quot;{iconSuggestion.keyword}&quot;</span>,
                  sugerimos o ícone <span className="font-semibold">{suggestedIcon.label}</span>{" "}
                  (família {CATEGORY_FAMILY_LABELS[iconSuggestion.family]}).
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      form.setValue("icon", iconSuggestion.icon, {
                        shouldDirty: true,
                        shouldTouch: true,
                        shouldValidate: true,
                      });
                      setDismissedSuggestion(null);
                    }}
                  >
                    Aplicar sugestão
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setDismissedSuggestion(suggestionKey)}
                  >
                    Manter ícone atual
                  </Button>
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ícone</FormLabel>
                  <FormControl>
                    <CategoryIconPicker
                      value={field.value}
                      onChange={(nextIcon) => {
                        field.onChange(nextIcon);
                        setDismissedSuggestion(null);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Esse ícone aparece no dashboard, filtros e lista de transações.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="income">Receita</SelectItem>
                      <SelectItem value="expense">Despesa</SelectItem>
                    </SelectContent>
                  </Select>
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
