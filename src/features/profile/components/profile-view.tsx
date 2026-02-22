"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/components/providers/auth-provider";
import { updatePasswordAction } from "../actions";

export function ProfileView() {
  const { user } = useAuth();
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleChangePassword() {
    if (newPwd.length < 6) {
      toast.error("A nova senha deve ter no mínimo 6 caracteres.");
      return;
    }
    if (newPwd !== confirmPwd) {
      toast.error("As senhas não coincidem.");
      return;
    }

    startTransition(async () => {
      const result = await updatePasswordAction(currentPwd, newPwd);
      if (result.success) {
        toast.success("Senha alterada com sucesso.");
        setCurrentPwd("");
        setNewPwd("");
        setConfirmPwd("");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Perfil</h1>
        <p className="text-muted-foreground">Gerencie suas informações pessoais.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Informações da conta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Email</label>
            <p className="text-sm">{user?.email ?? "—"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Membro desde</label>
            <p className="text-sm">
              {user?.createdAt
                ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(
                    new Date(user.createdAt)
                  )
                : "—"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alterar senha</CardTitle>
          <CardDescription>Preencha os campos abaixo para alterar sua senha.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Senha atual</label>
            <Input
              type="password"
              value={currentPwd}
              onChange={(e) => setCurrentPwd(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <Separator />
          <div>
            <label className="mb-1 block text-sm font-medium">Nova senha</label>
            <Input
              type="password"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              autoComplete="new-password"
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Confirmar nova senha</label>
            <Input
              type="password"
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div className="flex justify-end">
            <Button
              onClick={handleChangePassword}
              disabled={isPending || !currentPwd || !newPwd || !confirmPwd}
            >
              {isPending ? "Alterando..." : "Alterar senha"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
