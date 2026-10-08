import { getTranslations } from "next-intl/server";
import { ShieldCheck } from "lucide-react";


export default async function AdminPage() {
  const t = await getTranslations("portal");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
            <ShieldCheck className="size-3.5" />
            <span>Admin Clearance</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {t("adminTitle")}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {t("adminSubtitle")}
          </p>
        </div>
      </div>
    </div>
  );
}
