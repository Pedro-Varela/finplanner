"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Category } from "@/core/entities";
import { deleteCategoryAction } from "../actions";

interface DeleteCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  category: Category | null;
}

export function DeleteCategoryDialog({
  open,
  onOpenChange,
  onSuccess,
  category,
}: DeleteCategoryDialogProps) {
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    if (!category) return;

    startTransition(async () => {
      const result = await deleteCategoryAction(category.id);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Categoria excluída.");
      onOpenChange(false);
      onSuccess();
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir categoria</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir &quot;{category?.name}&quot;? Transações associadas
            ficarão sem categoria. Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
