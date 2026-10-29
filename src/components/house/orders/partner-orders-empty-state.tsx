import { Inbox, Package, CheckCircle2, Clock, Ban } from "lucide-react";
import { useTranslations } from "next-intl";
import type { PartnerOrderTab } from "@/dal/partner-order.dal";

interface PartnerOrdersEmptyStateProps {
  tab: PartnerOrderTab;
}

export function PartnerOrdersEmptyState({ tab }: PartnerOrdersEmptyStateProps) {
  const t = useTranslations("house.orders");

  const config: Record<PartnerOrderTab, { icon: typeof Inbox; titleKey: string }> = {
    to_accept: { icon: Clock, titleKey: "emptyToAccept" },
    to_collect: { icon: Package, titleKey: "emptyToCollect" },
    in_treatment: { icon: Inbox, titleKey: "emptyInTreatment" },
    ready: { icon: CheckCircle2, titleKey: "emptyReady" },
    delivered: { icon: CheckCircle2, titleKey: "emptyDelivered" },
    failed: { icon: Ban, titleKey: "emptyFailed" },
  };

  const { icon: Icon, titleKey } = config[tab] ?? { icon: Inbox, titleKey: "empty" };

  return (
    <div className="bg-card rounded-2xl p-8 sm:p-12 text-center space-y-3 font-sans">
      <div className="w-12 h-12 mx-auto rounded-xl bg-surface text-muted-foreground flex items-center justify-center">
        <Icon className="size-6" aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <h3 className="text-sm sm:text-base font-bold text-heading font-display">
          {t(titleKey)}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
          {t("empty")}
        </p>
      </div>
    </div>
  );
}
