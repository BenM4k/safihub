import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Plus } from "lucide-react";

interface DashboardHeroProps {
  userName?: string;
}

export async function DashboardHero({ userName }: DashboardHeroProps) {
  const t = await getTranslations("admin.dashboard");
  const firstName = userName ? userName.split(" ")[0] : "Admin";

  return (
    <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-[28px] sm:leading-8 font-semibold text-slate-900 tracking-tight">
          {t("welcomeBack", { name: firstName })}
        </h1>
        <p className="text-sm leading-5 text-slate-500 mt-0.5">
          {t("heroSubtitle")}
        </p>
      </div>

      <div className="flex items-center gap-3 self-start sm:self-auto">

        <Link
          href="/admin/orders/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-xs hover:shadow transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 cursor-pointer active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          <span>{t("newOrderBtn")}</span>
        </Link>
      </div>
    </section>
  );
}
