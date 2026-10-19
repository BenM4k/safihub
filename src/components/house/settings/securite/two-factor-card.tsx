"use client";

import { Shield } from "lucide-react";

export function TwoFactorCard() {
  return (
    <section className="bg-card rounded-2xl border border-border p-5 shadow-xs space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-secondary text-muted-foreground flex items-center justify-center">
            <Shield className="size-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-heading">Double authentification (2FA)</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Protection renforcée par code OTP / application d&apos;authentification.
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-secondary text-muted-foreground border border-border">
          Non configuré
        </span>
      </div>

      <p className="text-xs text-muted-foreground bg-surface p-3.5 rounded-xl border border-border leading-relaxed">
        La double authentification avec codes de secours et application TOTP fait partie des modules Better Auth proposés pour la prochaine mise à jour de sécurité de la plateforme.
      </p>
    </section>
  );
}
