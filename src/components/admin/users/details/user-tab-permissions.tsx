import { Check, ShieldCheck, X } from "lucide-react";
import { getRoleBadgeInfo } from "@/lib/user-formatters";
import { getPermissionsForRole } from "./permissions-rules";
import type { UserRow } from "../types";

interface UserTabPermissionsProps {
  user: UserRow;
}

export function UserTabPermissions({ user }: UserTabPermissionsProps) {
  const roleInfo = getRoleBadgeInfo(user.role);
  const permissions = getPermissionsForRole(user.role);

  return (
    <div className="space-y-4 text-xs">
      <div className="rounded-xl bg-card space-y-3">
        <div className="flex items-center justify-between border-b border-border/70 pb-3">
          <div className="flex items-center gap-2 font-bold text-heading">
            <ShieldCheck className="size-4 text-primary" />
            <span>Rôle et droits d&apos;accès</span>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-2xs font-semibold ${roleInfo.badgeClass}`}
          >
            {roleInfo.label}
          </span>
        </div>

        <div className="divide-y divide-border/60">
          {permissions.map((p, idx) => (
            <div key={idx} className="py-2.5 flex items-start justify-between gap-3">
              <div className="space-y-0.5">
                <div className="font-semibold text-heading">{p.resource}</div>
                <div className="text-2xs text-muted-foreground leading-relaxed">{p.description}</div>
              </div>
              <div className="shrink-0 pt-0.5">
                {p.allowed ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    <Check className="size-3" />
                    <span>Autorisé</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-md border border-border">
                    <X className="size-3" />
                    <span>Interdit</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
