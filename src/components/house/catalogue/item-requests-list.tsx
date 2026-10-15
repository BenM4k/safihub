import { Clock, CheckCircle2, XCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";

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
      <div className="bg-card rounded-2xl border border-border p-6 text-center text-xs text-muted-foreground shadow-xs">
        {t("noRequests")}
      </div>
    );
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success-soft text-success border border-success/20">
            <CheckCircle2 className="size-3" /> {t("statusApproved")}
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-destructive-soft text-destructive border border-destructive/20">
            <XCircle className="size-3" /> {t("statusRejected")}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-warning-soft text-warning border border-warning/20">
            <Clock className="size-3" /> {t("statusPending")}
          </span>
        );
    }
  }

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-xs">
      <div className="p-4 border-b border-border">
        <h3 className="font-bold text-sm text-heading">{t("myRequests")}</h3>
      </div>

      <div className="divide-y divide-border">
        {requests.map((req) => (
          <div key={req.id} className="p-4 flex items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-heading">{req.name}</span>
                <span className="text-[11px] text-muted-foreground capitalize">
                  ({req.kind === "item" ? t("kindItem") : t("kindFabric")})
                </span>
              </div>
              {req.note && <p className="text-muted-foreground text-[11px]">{req.note}</p>}
              {req.adminNote && (
                <p className="text-primary font-medium text-[11px]">
                  Réponse admin: {req.adminNote}
                </p>
              )}
            </div>
            <div className="shrink-0">{getStatusBadge(req.status)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
