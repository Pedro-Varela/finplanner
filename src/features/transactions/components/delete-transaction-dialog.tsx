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
import type { Transaction } from "@/core/entities";
import { deleteTransactionAction } from "../actions";

interface DeleteTransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  transaction: Transaction | null;
}

export function DeleteTransactionDialog({
  open,
  onOpenChange,
  onSuccess,
  transaction,
}: DeleteTransactionDialogProps) {
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    if (!transaction) return;

    startTransition(async () => {
      const result = await deleteTransactionAction(transaction.id);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Transação excluída.");
      onOpenChange(false);
      onSuccess();
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir transação</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir &quot;{transaction?.description}&quot;? Esta ação não
            pode ser desfeita.
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
