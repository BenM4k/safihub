"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, FileJson, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DataExportCard() {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = async (dataset: "orders" | "ledger" | "customers", format: "csv" | "json") => {
    try {
      const key = `${dataset}-${format}`;
      setDownloading(key);
      const res = await fetch(`/api/admin/export?dataset=${dataset}&format=${format}`);
      if (!res.ok) throw new Error("Échec du téléchargement");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `safihub-${dataset}-${new Date().toISOString().slice(0, 10)}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Export error:", err);
      alert("Erreur lors du téléchargement du fichier.");
    } finally {
      setDownloading(null);
    }
  };

  const datasets = [
    {
      id: "orders" as const,
      name: "Commandes & Traçabilité",
      description: "Toutes les commandes avec statuts, montants CDF/USD, créneaux et buanderies.",
    },
    {
      id: "ledger" as const,
      name: "Grand Livre de Caisse",
      description: "Écritures comptables append-only : encaissements, commissions et règlements.",
    },
    {
      id: "customers" as const,
      name: "Clients Enregistrés",
      description: "Liste des clients avec contacts, statut et date d'inscription.",
    },
  ];

  return (
    <div className="rounded-xl border border-[#EAECF0] bg-white p-6 shadow-sm space-y-4">
      <div>
        <div className="flex items-center gap-2">
          <Download className="size-5 text-sky-600" />
          <h2 className="text-base font-semibold text-[#101828]">
            Exportation des Données (Audit & Pilotage)
          </h2>
        </div>
        <p className="text-xs text-[#667085] mt-1">
          Exportez les données brutes pour vos sauvegardes locales, comptabilité ou revues du pilote.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {datasets.map((d) => (
            <div
              key={d.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3"
            >
              <div>
                <h4 className="font-semibold text-sm text-slate-900">{d.name}</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{d.description}</p>
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
                    <FileSpreadsheet className="size-3.5 text-emerald-600" />
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
                    <FileJson className="size-3.5 text-sky-600" />
                  )}
                  JSON
                </Button>
              </div>
            </div>
          ))}
        </div>
    </div>
  );
}
