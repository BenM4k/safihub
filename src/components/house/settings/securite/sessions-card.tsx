"use client";

import { useState, useTransition } from "react";
import { AlertCircle, CheckCircle2, Laptop, LogOut, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/shared";
import { revokeOtherSessionsAction } from "@/actions/house.actions";
import type { UserSessionDTO } from "@/dal";

interface SessionsCardProps {
  sessions: UserSessionDTO[];
  currentSessionId?: string;
}

export function SessionsCard({ sessions, currentSessionId }: SessionsCardProps) {
  const [, startTransition] = useTransition();
  const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState(false);
  const [sessionSuccess, setSessionSuccess] = useState<string | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);

  function handleRevokeOtherSessions() {
    setSessionError(null);
    setSessionSuccess(null);

    startTransition(async () => {
      const res = await revokeOtherSessionsAction();
      if (!res.ok) {
        setSessionError(res.error);
      } else {
        setSessionSuccess(`${res.value.revokedCount} autre(s) session(s) déconnectée(s).`);
        setIsRevokeDialogOpen(false);
        setTimeout(() => setSessionSuccess(null), 3000);
      }
    });
  }

  return (
    <section className="bg-card rounded-2xl border border-border p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-heading">Sessions actives</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Appareils actuellement connectés à votre compte pressing.
          </p>
        </div>

        {sessions.length > 1 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsRevokeDialogOpen(true)}
            className="text-xs font-semibold text-destructive border-destructive/30 hover:bg-destructive-soft min-h-[40px]"
          >
            <LogOut className="size-3.5 mr-1.5" />
            <span>Déconnecter les autres appareils</span>
          </Button>
        )}
      </div>

      {sessionSuccess && (
        <div className="p-3 bg-success-soft border border-success/30 rounded-xl text-xs text-success font-semibold flex items-center gap-2">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{sessionSuccess}</span>
        </div>
      )}
      {sessionError && (
        <div className="p-3 bg-destructive-soft border border-destructive/30 rounded-xl text-xs text-destructive font-semibold flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0" />
          <span>{sessionError}</span>
        </div>
      )}

      <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
        {sessions.map((sess) => {
          const isCurrent = sess.id === currentSessionId;
          const isMobile = sess.userAgent?.toLowerCase().includes("mobile");

          return (
            <div
              key={sess.id}
              className="p-4 flex items-center justify-between gap-3 text-xs hover:bg-surface transition"
            >
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-surface border border-border flex items-center justify-center text-muted-foreground">
                  {isMobile ? <Smartphone className="size-4" /> : <Laptop className="size-4" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-heading">
                      {isMobile ? "Navigateur mobile" : "Ordinateur de bureau"}
                    </span>
                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-success-soft text-success border border-success/30">
                        Cette session
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    IP : {sess.ipAddress || "Bukavu / RDC"} • Connecté le{" "}
                    {new Date(sess.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>

              {!isCurrent && (
                <span className="text-[11px] text-muted-foreground font-medium">
                  Session secondaire
                </span>
              )}
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        isOpen={isRevokeDialogOpen}
        onClose={() => setIsRevokeDialogOpen(false)}
        onConfirm={async () => handleRevokeOtherSessions()}
        title="Déconnecter les autres appareils"
        description="Cette action révoquera immédiatement toutes les sessions actives sur vos autres téléphones ou ordinateurs. Seule votre session actuelle restera active."
        confirmLabel="Déconnecter les autres appareils"
        cancelLabel="Annuler"
        variant="destructive"
      />
    </section>
  );
}
