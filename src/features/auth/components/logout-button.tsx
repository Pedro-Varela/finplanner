"use client";

import { LogOut } from "lucide-react";
import { logoutAction } from "../actions";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <Button variant="ghost" size="sm" type="submit" className="gap-2">
        <LogOut className="h-4 w-4" />
        Sair
      </Button>
    </form>
  );
}
