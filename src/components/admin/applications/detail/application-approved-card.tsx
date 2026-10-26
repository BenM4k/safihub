import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { CheckCircle2, XCircle, Building2, User, KeyRound } from "lucide-react";
import type { ApplicationStatus } from "@/services/db/schema";

interface ApplicationApprovedCardProps {
  status: ApplicationStatus;
  statusLabel: string;
  adminNote?: string | null;
  createdHouseId?: string | null;
  email: string;
}

export async function ApplicationApprovedCard({
  status,
  statusLabel,
  adminNote,
  createdHouseId,
  email,
}: ApplicationApprovedCardProps) {
  const t = await getTranslations("admin.applications");

  return (
    <div className="bg-card rounded-lg border border-border p-5 shadow-xs stack gap-4 text-xs">
      <div className="flex items-center gap-2 font-bold text-foreground">
        {status === "approved" ? (
          <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
        ) : (
          <XCircle className="size-4 text-rose-600 dark:text-rose-400" />
        )}
        <span>
          {t("statusLabel")} : {statusLabel}
        </span>
      </div>

      {adminNote && (
        <div>
          <span className="text-muted-foreground block font-semibold">{t("reviewNotes")} :</span>
          <p className="mt-1 text-foreground bg-muted/40 p-2.5 rounded-md border border-border">
            {adminNote}
          </p>
        </div>
      )}

      {createdHouseId && (
        <div className="pt-2 border-t border-border flex flex-wrap items-center gap-4">
          <Link
            href={`/admin/houses/${createdHouseId}`}
            className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1.5"
          >
            <Building2 className="size-3.5" />
            <span>{t("viewHouse")} →</span>
          </Link>

          <Link
            href={`/admin/users?search=${encodeURIComponent(email)}`}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground hover:underline inline-flex items-center gap-1.5"
          >
            <User className="size-3.5" />
            <span>{t("viewUser")}</span>
          </Link>

          <Link
            href={`/admin/users?search=${encodeURIComponent(email)}`}
            className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline inline-flex items-center gap-1.5"
          >
            <KeyRound className="size-3.5 text-amber-600 dark:text-amber-400" />
            <span>{t("resetPassword")}</span>
          </Link>
        </div>
      )}
    </div>
  );
}
