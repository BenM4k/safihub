"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, Download, FileSpreadsheet, FileJson, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface TruncationNotice {
  dataset: "orders" | "ledger" | "customers";
  format: "csv" | "json";
  rowCount: number;
  limit: number;
  nextOffset: number;
}

export function DataExportCard() {
  const t = useTranslations("admin.settings");
  const [downloading, setDownloading] = useState<string | null>(null);
  const [truncation, setTruncation] = useState<TruncationNotice | null>(null);

  const handleDownload = async (
    dataset: "orders" | "ledger" | "customers",
    format: "csv" | "json",
    offset = 0
  ) => {
    try {
      const key = `${dataset}-${format}`;
      setDownloading(key);
      if (offset === 0) {
        setTruncation(null);
      }

      const params = new URLSearchParams({ dataset, format });
      if (offset > 0) {
        params.set("offset", String(offset));
      }

      const res = await fetch(`/api/admin/export?${params.toString()}`);
      if (!res.ok) throw new Error("Export download failed");

      const isTruncated = res.headers.get("X-Export-Truncated") === "true";
      const rowCount = Number(res.headers.get("X-Export-Row-Count")) || 0;
      const limit = Number(res.headers.get("X-Export-Limit")) || 5000;
      const nextOffsetHeader = res.headers.get("X-Export-Next-Offset");
      const nextOffset = nextOffsetHeader ? Number(nextOffsetHeader) : null;

      if (isTruncated && nextOffset !== null && Number.isFinite(nextOffset)) {
        setTruncation({ dataset, format, rowCount, limit, nextOffset });
      } else {
        setTruncation(null);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const offsetSuffix = offset > 0 ? `-offset-${offset}` : "";
      a.download = `safihub-${dataset}-${new Date().toISOString().slice(0, 10)}${offsetSuffix}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Export error:", err);
      alert(t("exportError"));
    } finally {
      setDownloading(null);
    }
  };

  const datasets = [
    {
      id: "orders" as const,
      name: t("exportOrdersName"),
      description: t("exportOrdersDesc"),
    },
    {
      id: "ledger" as const,
      name: t("exportLedgerName"),
      description: t("exportLedgerDesc"),
    },
    {
      id: "customers" as const,
      name: t("exportCustomersName"),
      description: t("exportCustomersDesc"),
    },
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
      <div>
        <div className="flex items-center gap-2">
          <Download className="size-5 text-primary" />
          <h2 className="text-base font-semibold text-foreground">
            {t("exportTitle")}
          </h2>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {t("exportDesc")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {datasets.map((d) => (
          <div
            key={d.id}
            className="p-4 rounded-xl border border-border bg-muted/30 flex flex-col justify-between space-y-3"
          >
            <div>
              <h4 className="font-semibold text-sm text-foreground">{d.name}</h4>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{d.description}</p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-xs gap-1.5"
                disabled={downloading !== null}
                onClick={() => handleDownload(d.id, "csv")}
              >
                {downloading === `${d.id}-csv` ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <FileSpreadsheet className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                )}
                CSV
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-xs gap-1.5"
                disabled={downloading !== null}
                onClick={() => handleDownload(d.id, "json")}
              >
                {downloading === `${d.id}-json` ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <FileJson className="size-3.5 text-sky-600 dark:text-sky-400" />
                )}
                JSON
              </Button>
            </div>
          </div>
        ))}
      </div>

      {truncation && (
        <Alert className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="size-4 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <AlertTitle className="text-xs font-semibold">
                {t("exportTruncatedTitle", { count: truncation.rowCount })}
              </AlertTitle>
              <AlertDescription className="text-xs text-muted-foreground mt-0.5">
                {t("exportTruncatedDesc", { limit: truncation.limit })}
              </AlertDescription>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            disabled={downloading !== null}
            onClick={() =>
              handleDownload(
                truncation.dataset,
                truncation.format,
                truncation.nextOffset
              )
            }
            className="text-xs shrink-0"
          >
            {t("exportNextBatch", { nextOffset: truncation.nextOffset })}
          </Button>
        </Alert>
      )}
    </div>
  );
}

