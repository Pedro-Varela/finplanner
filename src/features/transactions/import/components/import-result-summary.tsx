"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ImportResult } from "@/core/entities";
import { CheckCircle2, SkipForward, Tag, AlertTriangle, Upload, ArrowRight } from "lucide-react";
import Link from "next/link";

interface ImportResultSummaryProps {
  result: ImportResult;
  onImportAnother: () => void;
}

export function ImportResultSummary({ result, onImportAnother }: ImportResultSummaryProps) {
  const hasErrors = result.errors.length > 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            Importação concluída
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stats */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-lg border p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold leading-none">{result.inserted}</p>
                <p className="text-xs text-muted-foreground">importadas</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                <SkipForward className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold leading-none">{result.skippedDuplicates}</p>
                <p className="text-xs text-muted-foreground">duplicadas ignoradas</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Tag className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold leading-none">{result.categorized}</p>
                <p className="text-xs text-muted-foreground">categorizadas automaticamente</p>
              </div>
            </div>
          </div>

          {/* Errors */}
          {hasErrors && (
            <div className="rounded-md border border-amber-500/50 bg-amber-500/10 px-4 py-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                  {result.errors.length} linha(s) não puderam ser importadas:
                </p>
              </div>
              <ul className="mt-2 list-inside list-disc text-sm text-amber-600 dark:text-amber-300">
                {result.errors.slice(0, 5).map((err) => (
                  <li key={err.line}>
                    Linha {err.line}: {err.reason}
                  </li>
                ))}
                {result.errors.length > 5 && <li>…e mais {result.errors.length - 5} erro(s)</li>}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Button variant="outline" className="gap-2" onClick={onImportAnother}>
              <Upload className="h-4 w-4" />
              Importar outro
            </Button>
            <Button asChild className="gap-2">
              <Link href="/transactions">
                Ver transações
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {result.inserted === 0 && result.skippedDuplicates > 0 && (
        <div className="rounded-md border border-blue-500/50 bg-blue-500/10 px-4 py-3">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Todas as transações deste arquivo já foram importadas anteriormente.
          </p>
        </div>
      )}
    </div>
  );
}
