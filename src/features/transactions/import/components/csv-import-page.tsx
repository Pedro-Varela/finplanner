"use client";

import { useCallback, useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { importNubankCsv } from "@/lib/importers";
import type { ImportedRow } from "@/lib/importers/nubank-csv-importer";
import type { ImportResult, Category } from "@/core/entities";
import {
  importNubankCsvAction,
  listMerchantRulesForPreviewAction,
  listCategoriesForImportAction,
} from "../actions";
import type { PreviewRule } from "../actions";
import { CsvUploader } from "./csv-uploader";
import { CsvPreviewTable } from "./csv-preview-table";
import { ImportResultSummary } from "./import-result-summary";

type PageState = "idle" | "preview" | "importing" | "result";

export function CsvImportPage() {
  const [state, setState] = useState<PageState>("idle");
  const [csvContent, setCsvContent] = useState<string>("");
  const [parsedRows, setParsedRows] = useState<ImportedRow[]>([]);
  const [parseErrors, setParseErrors] = useState<{ line: number; reason: string }[]>([]);
  const [rules, setRules] = useState<PreviewRule[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleFileLoaded = useCallback((content: string) => {
    // Parse CSV client-side for preview
    const { rows, errors } = importNubankCsv(content);

    if (rows.length === 0 && errors.length > 0) {
      toast.error(errors[0].reason);
      return;
    }

    if (rows.length === 0) {
      toast.error("Nenhuma transação encontrada no arquivo.");
      return;
    }

    setCsvContent(content);
    setParsedRows(rows);
    setParseErrors(errors);

    // Fetch rules + categories for category suggestion preview
    startTransition(async () => {
      const [rulesRes, catRes] = await Promise.all([
        listMerchantRulesForPreviewAction(),
        listCategoriesForImportAction(),
      ]);

      if (rulesRes.success) {
        setRules(rulesRes.data);
      }
      if (catRes.success) {
        setCategories(catRes.data);
      }

      setState("preview");
    });
  }, []);

  const handleImport = useCallback(() => {
    setState("importing");
    startTransition(async () => {
      const result = await importNubankCsvAction(csvContent);

      if (!result.success) {
        toast.error(result.error);
        setState("preview");
        return;
      }

      setImportResult(result.data);
      setState("result");
    });
  }, [csvContent]);

  const handleReset = useCallback(() => {
    setState("idle");
    setCsvContent("");
    setParsedRows([]);
    setParseErrors([]);
    setRules([]);
    setCategories([]);
    setImportResult(null);
  }, []);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Importar CSV</h1>
        <p className="text-muted-foreground">
          Importe transações a partir de um arquivo CSV do Nubank.
        </p>
      </div>

      {/* Step: Upload */}
      {state === "idle" && <CsvUploader onFileLoaded={handleFileLoaded} disabled={isPending} />}

      {/* Loading state while fetching rules */}
      {state === "idle" && isPending && (
        <div className="flex items-center justify-center gap-2 py-8 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Processando arquivo…</span>
        </div>
      )}

      {/* Step: Preview */}
      {(state === "preview" || state === "importing") && (
        <div className="space-y-4">
          <CsvPreviewTable
            rows={parsedRows}
            rules={rules}
            categories={categories}
            parseErrors={parseErrors}
          />

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleReset} disabled={state === "importing"}>
              Cancelar
            </Button>
            <Button className="gap-2" onClick={handleImport} disabled={state === "importing"}>
              {state === "importing" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Importando…
                </>
              ) : (
                <>
                  <FileUp className="h-4 w-4" />
                  Importar {parsedRows.length} transações
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step: Result */}
      {state === "result" && importResult && (
        <ImportResultSummary result={importResult} onImportAnother={handleReset} />
      )}
    </div>
  );
}
