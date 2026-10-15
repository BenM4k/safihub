"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "all", status: undefined },
  { key: "filterWaiting", status: "created" },
  { key: "filterProcessing", status: "washing" },
  { key: "filterReady", status: "ready" },
  { key: "filterCompleted", status: "delivered" },
];

export function OrdersFilterTabs({ houseSlug }: { houseSlug?: string }) {
  const t = useTranslations("house.orders");
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get("status");
  const base = houseSlug ? `/partner/${houseSlug}/orders` : "/partner";

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
      {TABS.map((tab) => {
        const isActive =
          (!currentStatus && !tab.status) || currentStatus === tab.status;

        const href = tab.status ? `${base}?status=${tab.status}` : base;

        return (
          <Link
            key={tab.key}
            href={href}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors",
              isActive
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-card text-muted-foreground hover:bg-secondary border border-border"
            )}
          >
            {t(tab.key)}
          </Link>
        );
      })}
    </div>
  );
}
