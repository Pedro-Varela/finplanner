"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Tag,
  LineChart,
  UserCircle,
  TrendingUp,
  Gauge,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/components/providers/auth-provider";
import { LogoutButton } from "@/features/auth";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Transações", href: "/transactions", icon: ArrowLeftRight },
  { label: "Score", href: "/score", icon: Gauge },
  { label: "Projeções", href: "/projections", icon: TrendingUp },
  { label: "Forecast", href: "/forecast", icon: LineChart },
  { label: "Categorias", href: "/categories", icon: Tag },
  { label: "Perfil", href: "/profile", icon: UserCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:border-r bg-card">
      <div className="flex h-16 items-center gap-2 px-6 font-bold text-xl">
        <span className="text-primary">Fin</span>Planner
      </div>
      <Separator />
      <nav className="flex-1 space-y-1 px-3 py-4">
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
      {user && (
        <>
          <Separator />
          <div className="flex items-center justify-between px-4 py-3">
            <span className="truncate text-sm text-muted-foreground">{user.email}</span>
            <LogoutButton />
          </div>
        </>
      )}
    </aside>
  );
}
