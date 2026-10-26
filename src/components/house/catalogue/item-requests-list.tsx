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
      <div className="bg-card rounded-2xl border border-border p-6 text-center text-xs text-muted-foreground shadow-xs">
        {t("noRequests")}
      </div>
    );
  }

  function renderStatusBadge(status: string) {
    switch (status) {
      case "approved":
        return (
          <Badge variant="outline" className="gap-1 font-semibold bg-success-soft text-success border-success/30">
            <CheckCircle2 className="size-3" />
            <span>{t("statusApproved")}</span>
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="gap-1 font-semibold bg-destructive-soft text-destructive border-destructive/30">
            <XCircle className="size-3" />
            <span>{t("statusRejected")}</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1 font-semibold bg-warning-soft text-warning border-warning/30">
            <Clock className="size-3" />
            <span>{t("statusPending")}</span>
          </Badge>
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
