import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardHeroProps {
  userName?: string;
}

export async function DashboardHero({ userName }: DashboardHeroProps) {
  const t = await getTranslations("admin.dashboard");
  const firstName = userName ? userName.split(" ")[0] : "Admin";

  return (
    <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-[28px] sm:leading-8 font-bold text-foreground tracking-tight">
          {t("welcomeBack", { name: firstName })}
        </h1>
        <p className="text-sm leading-5 text-muted-foreground mt-0.5">
          {t("heroSubtitle")}
        </p>
      </div>

      <div className="flex items-center gap-3 self-start sm:self-auto">
        <Button asChild size="sm" className="gap-2 font-medium">
          <Link href="/admin/orders/new">
            <Plus className="size-4" />
            <span>{t("newOrderBtn")}</span>
          </Link>
        </Button>
      </div>
    </section>
  );
}

