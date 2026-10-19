"use client";

import { UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { HouseStaffMemberRecord } from "@/dal";

interface MembersListCardProps {
  staff: HouseStaffMemberRecord[];
  onOpenInvite: () => void;
  onRemoveClick: (member: HouseStaffMemberRecord) => void;
}

export function MembersListCard({
  staff,
  onOpenInvite,
  onRemoveClick,
}: MembersListCardProps) {
  return (
    <section className="bg-card rounded-2xl border border-border p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-heading flex items-center gap-2">
            <Users className="size-4 text-primary" />
            <span>Membres du pressing ({staff.length})</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Collaborateurs disposant d&apos;un accès au portail de votre pressing.
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          onClick={onOpenInvite}
          className="min-h-[44px] bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs shadow-xs"
        >
          <UserPlus className="size-3.5 mr-1.5" />
          <span>Inviter un collaborateur</span>
        </Button>
      </div>

      <div className="divide-y divide-border border border-border rounded-xl overflow-hidden">
        {staff.map((m) => {
          const isOwner = m.role === "admin" || m.role === "owner" || m.role === "house";
          const roleLabel = isOwner ? "Propriétaire" : m.role === "manager" ? "Gérant" : "Opérateur";

          return (
            <div
              key={m.userId}
              className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs hover:bg-surface transition"
            >
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-heading text-sm">{m.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      isOwner
                        ? "bg-primary/10 text-primary border-primary/20"
                        : "bg-secondary text-muted-foreground border-border"
                    }`}
                  >
                    {roleLabel}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-success-soft text-success border border-success/30">
                    Actif
                  </span>
                </div>
                <p className="text-muted-foreground text-[11px] mt-0.5">{m.email}</p>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onRemoveClick(m)}
                  className="text-destructive hover:text-destructive hover:bg-destructive-soft min-h-[40px] px-3 text-xs"
                >
                  Retirer
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
