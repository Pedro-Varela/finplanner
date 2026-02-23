"use client";

import { useCallback, useState, useRef } from "react";
import { Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface CsvUploaderProps {
  onFileLoaded: (csvContent: string, fileName: string) => void;
  disabled?: boolean;
}

export function CsvUploader({ onFileLoaded, disabled }: CsvUploaderProps) {
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    (file: File) => {
      setError(null);

      if (!file.name.toLowerCase().endsWith(".csv")) {
        setError("Apenas arquivos .csv são permitidos.");
        return;
      }

      if (file.size === 0) {
        setError("O arquivo está vazio.");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("O arquivo é muito grande (máx. 5 MB).");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        if (!content?.trim()) {
          setError("O arquivo está vazio.");
          return;
        }
        setFileName(file.name);
        onFileLoaded(content, file.name);
      };
      reader.onerror = () => {
        setError("Erro ao ler o arquivo. Tente novamente.");
      };
      reader.readAsText(file, "utf-8");
    },
    [onFileLoaded]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      // Reset input so the same file can be re-selected
      e.target.value = "";
    },
    [processFile]
  );

  function handleClear() {
    setFileName(null);
    setError(null);
  }

  return (
    <div className="space-y-3">
      <Card
        className={`relative cursor-pointer border-2 border-dashed p-8 text-center transition-colors ${
          dragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
        } ${disabled ? "pointer-events-none opacity-50" : ""}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleInputChange}
          disabled={disabled}
        />

        <div className="flex flex-col items-center gap-3">
          {fileName ? (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                <FileText className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="font-medium">{fileName}</p>
                <p className="text-sm text-muted-foreground">Arquivo carregado com sucesso</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-muted-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
              >
                <X className="h-3.5 w-3.5" />
                Remover
              </Button>
            </>
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Arraste seu arquivo CSV aqui</p>
                <p className="text-sm text-muted-foreground">
                  ou clique para selecionar · Nubank (.csv)
                </p>
              </div>
            </>
          )}
        </div>
      </Card>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
    </div>
  );
}
