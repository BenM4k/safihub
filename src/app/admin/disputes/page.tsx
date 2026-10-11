import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AlertTriangle, CheckCircle2, Clock, Package } from "lucide-react";
import { guardAdminRoute } from "@/services/auth";
import { getAdminDisputes } from "@/dal";

export const metadata: Metadata = {
  title: "Litiges | Console SafiHub Admin",
  description: "Gestion et résolution des litiges clients et pressing",
};

export default async function AdminDisputesPage() {
  await guardAdminRoute();
  const [tAdmin, disputes] = await Promise.all([
    getTranslations("admin"),
    getAdminDisputes(),
  ]);

  const openCount = disputes.filter((d) => d.status === "open").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {tAdmin("nav.disputes")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {tAdmin("dashboard.openDisputes")} : {openCount} sur {disputes.length}
          </p>
        </div>
      </div>

      {disputes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="size-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="size-6" />
          </div>
          <h2 className="text-sm font-bold text-slate-800">
            Aucun litige enregistré
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Toutes les commandes sont traitées sans réclamation ouverte.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {disputes.map((dispute) => {
            const isOpen = dispute.status === "open";
            return (
              <div
                key={dispute.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        isOpen
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}
                    >
                      {isOpen ? (
                        <AlertTriangle className="size-3" />
                      ) : (
                        <CheckCircle2 className="size-3" />
                      )}
                      <span>{isOpen ? "Ouvert" : "Résolu"}</span>
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 capitalize">
                      {dispute.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock className="size-3" />
                    <span>
                      {new Date(dispute.createdAt).toLocaleDateString("fr-FR", {
                        timeZone: "Africa/Lubumbashi",
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-normal bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {dispute.description}
                </p>

                <div className="flex items-center justify-between pt-1">
                  <Link
                    href={`/admin/orders`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                  >
                    <Package className="size-3.5" />
                    <span>Commande #{dispute.orderCode || dispute.orderId.slice(0, 8)}</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
