"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CategoryChip } from "@/components/category-chip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ImportedRow } from "@/lib/importers/nubank-csv-importer";
import type { Category } from "@/core/entities";
import { extractMerchantBase } from "@/lib/categorization";
import { applyRules } from "@/lib/categorization";
import type { PreviewRule } from "../actions";
import { Filter, FilterX } from "lucide-react";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("pt-BR").format(new Date(iso + "T00:00:00"));
}

export interface PreviewRow extends ImportedRow {
  merchantBase: string;
  suggestedCategoryId: string | null;
}

interface CsvPreviewTableProps {
  rows: ImportedRow[];
  rules: PreviewRule[];
  categories: Category[];
  parseErrors: { line: number; reason: string }[];
}

export function CsvPreviewTable({ rows, rules, categories, parseErrors }: CsvPreviewTableProps) {
  const [filterUncategorized, setFilterUncategorized] = useState(false);

  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  const enrichedRows: PreviewRow[] = useMemo(() => {
    return rows.map((row) => {
      const merchantBase = extractMerchantBase(row.description);
      const ruleInputs = rules.map((r) => ({
        pattern: r.pattern,
        matchType: r.matchType,
        categoryId: r.categoryId,
        priority: r.priority,
      }));
      const suggestedCategoryId = applyRules(merchantBase, ruleInputs);
      return { ...row, merchantBase, suggestedCategoryId };
    });
  }, [rows, rules]);

  const displayedRows = useMemo(() => {
    if (!filterUncategorized) return enrichedRows;
    return enrichedRows.filter((r) => !r.suggestedCategoryId);
  }, [enrichedRows, filterUncategorized]);

  const categorizedCount = enrichedRows.filter((r) => r.suggestedCategoryId).length;
  const uncategorizedCount = enrichedRows.length - categorizedCount;

  return (
    <div className="space-y-3">
      {/* Header with stats and filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{enrichedRows.length}</span> transações
            encontradas
            {categorizedCount > 0 && (
              <>
                {" · "}
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  {categorizedCount}
                </span>{" "}
                categorizadas
              </>
            )}
            {uncategorizedCount > 0 && (
              <>
                {" · "}
                <span className="font-medium text-amber-600 dark:text-amber-400">
                  {uncategorizedCount}
                </span>{" "}
                sem categoria
              </>
            )}
          </p>
        </div>

        {uncategorizedCount > 0 && (
          <Button
            variant={filterUncategorized ? "default" : "outline"}
            size="sm"
            className="gap-1.5"
            onClick={() => setFilterUncategorized(!filterUncategorized)}
          >
            {filterUncategorized ? (
              <FilterX className="h-3.5 w-3.5" />
            ) : (
              <Filter className="h-3.5 w-3.5" />
            )}
            {filterUncategorized ? "Mostrar todas" : "Apenas sem categoria"}
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Categoria</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  {filterUncategorized
                    ? "Todas as transações possuem categoria sugerida."
                    : "Nenhuma transação encontrada."}
                </TableCell>
              </TableRow>
            ) : (
              displayedRows.map((row, index) => {
                const cat = row.suggestedCategoryId
                  ? categoryMap.get(row.suggestedCategoryId as Category["id"])
                  : null;
                return (
                  <TableRow key={`${row.date}-${row.description}-${index}`}>
                    <TableCell className="whitespace-nowrap">{formatDate(row.date)}</TableCell>
                    <TableCell className="max-w-[300px] truncate font-medium">
                      {row.description}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right font-medium text-red-500">
                      − {formatCurrency(row.amount)}
                    </TableCell>
                    <TableCell>
                      {cat ? (
                        <div className="flex items-center gap-1.5">
                          <CategoryChip name={cat.name} icon={cat.icon} type={cat.type} />
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            Sugerida
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Sem categoria</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Parse errors */}
      {parseErrors.length > 0 && (
        <div className="rounded-md border border-amber-500/50 bg-amber-500/10 px-4 py-3">
          <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
            {parseErrors.length} linha(s) com erros de parsing:
          </p>
          <ul className="mt-1 list-inside list-disc text-sm text-amber-600 dark:text-amber-300">
            {parseErrors.slice(0, 5).map((err) => (
              <li key={err.line}>
                Linha {err.line}: {err.reason}
              </li>
            ))}
            {parseErrors.length > 5 && <li>…e mais {parseErrors.length - 5} erro(s)</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
