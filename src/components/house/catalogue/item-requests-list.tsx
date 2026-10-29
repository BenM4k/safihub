import { Clock, CheckCircle2, XCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";

export async function ItemRequestsList({
  requests,
}: {
  requests: Array<{
    id: string;
    kind: "item" | "fabric";
    name: string;
    note: string | null;
    status: "pending" | "approved" | "rejected";
    adminNote: string | null;
    createdAt: Date;
  }>;
}) {
  const t = await getTranslations("house.catalogue");

  if (requests.length === 0) {
    return (
      <div className="bg-card rounded-2xl p-6 text-center text-xs text-slate-600 dark:text-slate-300 shadow-xs font-sans">
        {t("noRequests")}
      </div>
    );
  }

  function renderStatusBadge(status: string) {
    switch (status) {
      case "approved":
        return (
          <Badge variant="outline" className="gap-1 font-semibold bg-emerald-500/10 text-emerald-950 dark:text-emerald-200 border-emerald-500/20 text-xs rounded-full">
            <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
            <span>{t("statusApproved")}</span>
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="gap-1 font-semibold bg-destructive/10 text-destructive border-destructive/20 text-xs rounded-full">
            <XCircle className="size-3 text-destructive" />
            <span>{t("statusRejected")}</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1 font-semibold bg-amber-500/10 text-amber-900 dark:text-amber-200 border-amber-500/20 text-xs rounded-full">
            <Clock className="size-3 text-amber-600 dark:text-amber-400" />
            <span>{t("statusPending")}</span>
          </Badge>
        );
    }
  }

  return (
    <div className="bg-card rounded-2xl overflow-hidden shadow-xs font-sans">
      <div className="p-4 border-b border-border/60">
        <h3 className="font-display font-bold text-sm text-heading tracking-tight">{t("myRequests")}</h3>
      </div>

      <div className="divide-y divide-border/60">
        {requests.map((req) => (
          <div key={req.id} className="p-4 flex items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-heading">{req.name}</span>
                <span className="text-[11px] text-muted-foreground capitalize">
                  ({req.kind === "item" ? t("kindItem") : t("kindFabric")})
                </span>
              </div>
              {req.note && <p className="text-slate-600 dark:text-slate-300 text-[11px]">{req.note}</p>}
              {req.adminNote && (
                <p className="text-primary font-medium text-[11px]">
                  {t("adminResponse", { note: req.adminNote })}
                </p>
              )}
            </div>
            <div className="shrink-0">{renderStatusBadge(req.status)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
