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
      <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-xs text-slate-500 shadow-xs">
        {t("noRequests")}
      </div>
    );
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="size-3" /> {t("statusApproved")}
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="size-3" /> {t("statusRejected")}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="size-3" /> {t("statusPending")}
          </span>
        );
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      <div className="p-4 border-b border-slate-100">
        <h3 className="font-bold text-sm text-slate-900">{t("myRequests")}</h3>
      </div>

      <div className="divide-y divide-slate-100">
        {requests.map((req) => (
          <div key={req.id} className="p-4 flex items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900">{req.name}</span>
                <span className="text-[11px] text-slate-400 capitalize">
                  ({req.kind === "item" ? t("kindItem") : t("kindFabric")})
                </span>
              </div>
              {req.note && <p className="text-slate-500 text-[11px]">{req.note}</p>}
              {req.adminNote && (
                <p className="text-violet-700 font-medium text-[11px]">
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
