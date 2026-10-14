import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AlertCircle, RefreshCw } from "lucide-react";
import { getAdminDispatchData } from "@/services/admin";
import { DispatchDashboard } from "@/components/admin/dispatch/dispatch-dashboard";
import { Button } from "@/components/ui/button";

export default async function AdminDispatchPage() {
  const t = await getTranslations("admin.dispatch");
  const res = await getAdminDispatchData();

  if (!res.ok) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center space-y-4 rounded-2xl border border-destructive/30 bg-destructive-soft mt-12 font-sans">
        <div className="w-12 h-12 mx-auto rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-heading font-display">
            {t("errorLoadingDispatch")}
          </h2>
          <p className="text-xs text-destructive">{res.error}</p>
        </div>
        <div>
          <Button asChild size="sm" className="bg-primary text-primary-foreground hover:bg-primary-hover text-xs min-h-[40px] px-4 font-display">
            <Link href="/admin/dispatch">
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              {t("retryDispatch")}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return <DispatchDashboard initialData={res.value} />;
}
