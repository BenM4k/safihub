import { getTranslations } from "next-intl/server";
import { Sparkles } from "lucide-react";

export default async function HousePage() {
  const t = await getTranslations("portal");

  return (
    <div className="space-y-6">
      <div className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 mb-2">
          <Sparkles className="size-3.5" />
          <span>Laundry House Portal</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          {t("houseTitle")}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {t("houseSubtitle")}
        </p>
      </div>
    </div>
  );
}
