"use client";

import { Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function TwoFactorCard() {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-secondary text-muted-foreground flex items-center justify-center shrink-0">
            <Shield className="size-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">Double authentification (2FA)</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Protection renforcée par code OTP / application d&apos;authentification.
            </p>
          </div>
        </div>

        <Badge variant="secondary" className="text-[10px] font-bold">
          Non configuré
        </Badge>
      </div>

      <p className="text-xs text-muted-foreground bg-muted/20 p-3.5 rounded-xl border border-border/60 leading-relaxed">
        La double authentification avec codes de secours et application TOTP fait partie des modules Better Auth proposés pour la prochaine mise à jour de sécurité de la plateforme.
      </p>
    </section>
  );
}
