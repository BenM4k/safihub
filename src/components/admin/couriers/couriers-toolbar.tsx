"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminSearchInput } from "@/components/admin/shared/admin-search-input";
import type { CouriersStatusTab } from "@/lib/admin-couriers-query";

interface CouriersToolbarProps {
  activeStatus: CouriersStatusTab;
  counts: {
    all: number;
    active: number;
    inactive: number;
  };
}

export function CouriersToolbar({ activeStatus, counts }: CouriersToolbarProps) {
  const t = useTranslations("admin.couriers");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(nextStatus: CouriersStatusTab) {
    const nextParams = new URLSearchParams(searchParams.toString());
    if (nextStatus === "all") nextParams.delete("status");
    else nextParams.set("status", nextStatus);
    nextParams.delete("page");
    const qs = nextParams.toString();
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  }

  return (
    <div className="p-4 border-b border-border bg-muted/20 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
      <Tabs
        value={activeStatus}
        onValueChange={(val) => handleStatusChange(val as CouriersStatusTab)}
      >
        <TabsList className="h-11">
          <TabsTrigger value="all" className="min-h-10 text-xs px-3 gap-1.5">
            <span>{t("filterAll")}</span>
            <span className="px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-mono tabular-nums text-[11px]">
              {counts.all}
            </span>
          </TabsTrigger>
          <TabsTrigger value="active" className="min-h-10 text-xs px-3 gap-1.5">
            <span>{t("statusActive")}</span>
            <span className="px-1.5 py-0.5 rounded-full bg-success-soft text-success font-mono tabular-nums text-[11px]">
              {counts.active}
            </span>
          </TabsTrigger>
          <TabsTrigger value="inactive" className="min-h-10 text-xs px-3 gap-1.5">
            <span>{t("statusInactive")}</span>
            <span className="px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-mono tabular-nums text-[11px]">
              {counts.inactive}
            </span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="w-full lg:max-w-sm">
        <AdminSearchInput
          urlMode
          placeholder={t("searchCouriersPlaceholder")}
          ariaLabel={t("searchCouriersPlaceholder")}
          isLoading={isPending}
        />
      </div>
    </div>
  );
}
