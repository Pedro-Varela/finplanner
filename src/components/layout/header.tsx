"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, LayoutDashboard, ArrowLeftRight, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/auth-provider";
import { LogoutButton } from "@/features/auth";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Transações", href: "/transactions", icon: ArrowLeftRight },
  { label: "Categorias", href: "/categories", icon: Tag },
];

export function Header() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex h-16 items-center gap-2 px-6 font-bold text-xl">
            <span className="text-primary">Fin</span>Planner
          </div>
          <Separator />
          <nav className="space-y-1 px-3 py-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Button
                  key={item.href}
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn("w-full justify-start gap-3", isActive && "font-semibold")}
                  asChild
                >
                  <Link href={item.href}>
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </Button>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>

      <div className="flex-1" />

      {user && (
        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted-foreground sm:inline-block">{user.email}</span>
          <LogoutButton />
        </div>
      )}
    </header>
  );
}
