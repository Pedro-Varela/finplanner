"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getInsightsAction, resolveInsightAction } from "@/features/insights/actions";
import type { Insight, InsightId } from "@/core/entities/insight";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function NotificationsBell() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const router = useRouter();

  async function loadInsights() {
    const res = await getInsightsAction();
    if (res.success) {
      setInsights(res.data);
    }
  }

  useEffect(() => {
    loadInsights();
    // Poll every 5 minutes
    const interval = setInterval(loadInsights, 1000 * 60 * 5);
    return () => clearInterval(interval);
  }, []);

  async function handleResolve(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    const res = await resolveInsightAction(id as InsightId);
    if (res.success) {
      toast.success("Insight marcado como resolvido!");
      setInsights((prev) => prev.filter((i) => i.id !== id));
    } else {
      toast.error(res.error);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {insights.length > 0 && (
            <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-red-600" />
          )}
          <span className="sr-only">Notificações</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Insights & Notificações</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {insights.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Você não tem novos insights.
          </div>
        ) : (
          <div className="max-h-[300px] overflow-y-auto">
            {insights.slice(0, 5).map((insight) => (
              <DropdownMenuItem
                key={insight.id}
                className="flex flex-col items-start p-4 hover:bg-muted cursor-default focus:bg-muted"
                onClick={() => router.push("/insights")}
              >
                <div className="flex w-full items-start justify-between">
                  <span className="font-semibold text-sm">{insight.title}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(insight.createdAt), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                  {insight.description}
                </p>
                <Button
                  variant="link"
                  className="mt-2 h-auto p-0 text-xs text-blue-500"
                  onClick={(e) => handleResolve(e, insight.id)}
                >
                  Marcar como lido
                </Button>
              </DropdownMenuItem>
            ))}
          </div>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="w-full cursor-pointer justify-center text-sm text-blue-500 font-medium"
          onClick={() => router.push("/insights")}
        >
          Ver todos
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
