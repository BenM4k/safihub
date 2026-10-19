"use client";

import { useState } from "react";
import { AlertTriangle, Clock, Download, Globe, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared";

export function PreferencesTab() {
  const [selectedLanguage, setSelectedLanguage] = useState("fr");
  const [isClosureDialogOpen, setIsClosureDialogOpen] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  function handleExportData() {
    setActionNotice("Votre export complet de données a été généré et téléchargé.");
    setTimeout(() => setActionNotice(null), 3000);
  }

  function handleCloseRequest() {
    setIsClosureDialogOpen(false);
    setActionNotice(
      "Votre demande de fermeture a été transmise à l'administrateur SafiHub pour vérification des soldes et livraisons en cours."
    );
    setTimeout(() => setActionNotice(null), 5000);
  }

  return (
    <div className="space-y-6">
      {actionNotice && (
        <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl text-xs text-primary font-semibold">
          {actionNotice}
        </div>
      )}

      {/* 1. Regional Preferences */}
      <section className="bg-card rounded-2xl border border-border p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Globe className="size-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-heading">Préférences régionales</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Langue et fuseau horaire opérationnel.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-semibold text-foreground block mb-1.5">
              Langue de l&apos;interface
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full h-10 min-h-[44px] px-3 rounded-xl border border-border text-xs bg-card focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="fr">Français (RDC)</option>
              <option value="sw">Kiswahili (Kivu)</option>
              <option value="en">English</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
              <Clock className="size-3.5 text-muted-foreground" />
              <span>Fuseau horaire officiel</span>
            </label>
            <input
              type="text"
              value="Heure de Bukavu (UTC+2 / Africa/Lubumbashi)"
              disabled
              className="w-full h-10 min-h-[44px] px-3 rounded-xl border border-border bg-secondary/60 text-muted-foreground text-xs font-medium cursor-not-allowed"
            />
          </div>
        </div>
      </section>

      {/* 2. Zone sensible */}
      <section className="bg-card rounded-2xl border-2 border-destructive/20 p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 text-destructive">
          <div className="size-8 rounded-lg bg-destructive-soft text-destructive flex items-center justify-center">
            <ShieldAlert className="size-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-heading text-destructive">Zone sensible</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Actions irréversibles et demandes de clôture de compte.
            </p>
          </div>
        </div>

        <div className="space-y-3 divide-y divide-border pt-1">
          {/* Export data */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 text-xs">
            <div>
              <span className="font-bold text-heading block">Exporter mes données</span>
              <p className="text-muted-foreground text-[11px] mt-0.5">
                Télécharger une copie complète au format JSON/CSV de vos commandes, catalogue et versements.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExportData}
              className="min-h-[40px] px-3 text-xs font-semibold self-start sm:self-auto"
            >
              <Download className="size-3.5 mr-1.5" />
              <span>Exporter les données</span>
            </Button>
          </div>

          {/* Closure request */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 text-xs">
            <div>
              <span className="font-bold text-destructive block">Demander la fermeture du pressing</span>
              <p className="text-muted-foreground text-[11px] mt-0.5">
                Nécessite la clôture préalable de toutes les commandes en cours et la liquidation des versements dus.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsClosureDialogOpen(true)}
              className="min-h-[40px] px-3 text-xs font-semibold text-destructive border-destructive/30 hover:bg-destructive-soft self-start sm:self-auto"
            >
              <AlertTriangle className="size-3.5 mr-1.5" />
              <span>Demander la fermeture</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Closure Confirm Dialog */}
      <ConfirmDialog
        isOpen={isClosureDialogOpen}
        onClose={() => setIsClosureDialogOpen(false)}
        onConfirm={async () => handleCloseRequest()}
        title="Demande de fermeture de compte"
        description="Une demande de clôture sera envoyée aux administrateurs SafiHub. Le compte ne pourra être définitivement fermé qu'après règlement intégral de votre solde et livraison de toutes les commandes en cours."
        confirmLabel="Transmettre la demande"
        cancelLabel="Annuler"
        variant="destructive"
      />
    </div>
  );
}
