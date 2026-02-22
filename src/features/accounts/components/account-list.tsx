"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Plus, CreditCard, Landmark, PiggyBank } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Account, AccountType } from "@/core/entities";
import {
  listAccountsAction,
  createAccountAction,
  updateAccountAction,
  deleteAccountAction,
} from "../actions";

const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  checking: "Conta Corrente",
  savings: "Poupança",
  credit_card: "Cartão de Crédito",
};

const ACCOUNT_TYPE_ICONS: Record<AccountType, typeof Landmark> = {
  checking: Landmark,
  savings: PiggyBank,
  credit_card: CreditCard,
};

export function AccountList() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, startTransition] = useTransition();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<string>("checking");

  const load = useCallback(() => {
    startTransition(async () => {
      const res = await listAccountsAction();
      if (res.success) setAccounts(res.data);
      else toast.error(res.error);
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function openNew() {
    setEditing(null);
    setFormName("");
    setFormType("checking");
    setFormOpen(true);
  }

  function openEdit(acc: Account) {
    setEditing(acc);
    setFormName(acc.name);
    setFormType(acc.type);
    setFormOpen(true);
  }

  async function handleSave() {
    const result = editing
      ? await updateAccountAction(editing.id, { name: formName, type: formType })
      : await createAccountAction({ name: formName, type: formType });

    if (result.success) {
      toast.success(editing ? "Conta atualizada." : "Conta criada.");
      setFormOpen(false);
      load();
    } else {
      toast.error(result.error);
    }
  }

  async function handleDelete(id: string) {
    const result = await deleteAccountAction(id);
    if (result.success) {
      toast.success("Conta removida.");
      load();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contas</h1>
          <p className="text-muted-foreground">Gerencie suas contas bancárias e cartões.</p>
        </div>
        <Button onClick={openNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova conta
        </Button>
      </div>

      {isLoading && accounts.length === 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl border bg-muted/40" />
          ))}
        </div>
      ) : accounts.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Nenhuma conta criada ainda.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((acc) => {
            const Icon = ACCOUNT_TYPE_ICONS[acc.type];
            return (
              <Card key={acc.id}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-3">
                    <div className="rounded-md bg-muted p-2">
                      <Icon className="h-4 w-4" />
                    </div>
                    <CardTitle className="text-base">{acc.name}</CardTitle>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        ···
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(acc)}>Editar</DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(acc.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary">{ACCOUNT_TYPE_LABELS[acc.type]}</Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar conta" : "Nova conta"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Nome</label>
              <Input
                placeholder="Ex: Nubank, Itaú..."
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Tipo</label>
              <Select value={formType} onValueChange={setFormType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="checking">Conta Corrente</SelectItem>
                  <SelectItem value="savings">Poupança</SelectItem>
                  <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setFormOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={!formName.trim()}>
                {editing ? "Salvar" : "Criar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
