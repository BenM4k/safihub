"use client";

import { useState } from "react";
import { UserPlus, Users } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StaffPagination } from "./staff-pagination";
import type { HouseStaffMemberRecord } from "@/dal";

interface MembersListCardProps {
  staff: HouseStaffMemberRecord[];
  onRemoveClick?: (member: HouseStaffMemberRecord) => void;
}

export function MembersListCard({ staff, onRemoveClick }: MembersListCardProps) {
  const t = useTranslations("house.settings");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const totalPages = Math.max(1, Math.ceil(staff.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedStaff = staff.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize
  );

  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
            <Users className="size-4 text-primary" />
            <span>Membres du pressing ({staff.length})</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
            Collaborateurs disposant d&apos;un accès au portail de votre pressing.
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          disabled
          variant="secondary"
          className="min-h-[40px] text-xs font-semibold self-start sm:self-auto gap-1.5 opacity-60 cursor-not-allowed rounded-lg"
        >
          <UserPlus className="size-3.5" />
          <span>Inviter un collaborateur (Bientôt disponible)</span>
        </Button>
      </div>

      {staff.length === 0 ? (
        <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border/80 rounded-2xl">
          {t("noStaff")}
        </div>
      ) : (
        <div className="divide-y divide-border/60 rounded-2xl overflow-hidden bg-card shadow-xs">
          {paginatedStaff.map((m) => {
            const isOwner = m.role === "admin" || m.role === "owner" || m.role === "house";
            const roleLabel = isOwner ? "Propriétaire" : m.role === "manager" ? "Gérant" : "Opérateur";

            return (
              <div
                key={m.userId}
                className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs hover:bg-muted/30 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-foreground text-sm">{m.name}</span>
                    <Badge
                      variant={isOwner ? "default" : "secondary"}
                      className="text-[10px] font-bold rounded-full"
                    >
                      {roleLabel}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-[10px] font-bold text-success border-success/30 bg-success-soft/30 rounded-full"
                    >
                      Actif
                    </Badge>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5">{m.email}</p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled
                    onClick={() => onRemoveClick?.(m)}
                    className="text-muted-foreground opacity-50 cursor-not-allowed min-h-[36px] px-3 text-xs rounded-lg"
                  >
                    Indisponible
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {staff.length > 5 && (
        <StaffPagination
          currentPage={safeCurrentPage}
          pageSize={pageSize}
          totalItems={staff.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      )}
    </section>
  );
}
