"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminSearchInput } from "@/components/admin/shared/admin-search-input";
import type { DisputeStatusFilter } from "@/lib/admin-disputes-query";

interface DisputesToolbarProps {
  activeStatus: DisputeStatusFilter;
  counts: {
    all: number;
    open: number;
    resolved: number;
  };
}

export function DisputesToolbar({ activeStatus, counts }: DisputesToolbarProps) {
  const t = useTranslations("admin.disputes");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(nextStatus: DisputeStatusFilter) {
    const nextParams = new URLSearchParams(searchParams.toString());
    if (nextStatus === "all") {
      nextParams.delete("status");
    } else {
      nextParams.set("status", nextStatus);
    }
    nextParams.delete("page");
    const qs = nextParams.toString();
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  }

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 animate-enter-fast">
      <Tabs
        value={activeStatus}
        onValueChange={(val) => handleStatusChange(val as DisputeStatusFilter)}
      >
        <TabsList className="h-11">
          <TabsTrigger value="all" className="min-h-10 px-3 text-xs gap-1.5">
            <span>{t("tabAll")}</span>
            <span className="px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-mono tabular-nums text-[11px]">
              {counts.all}
            </span>
          </TabsTrigger>
          <TabsTrigger value="open" className="min-h-10 px-3 text-xs gap-1.5">
            <span>{t("statusOpen")}</span>
            <span className="px-1.5 py-0.5 rounded-full bg-destructive-soft text-destructive font-mono tabular-nums text-[11px]">
              {counts.open}
            </span>
          </TabsTrigger>
          <TabsTrigger value="resolved" className="min-h-10 px-3 text-xs gap-1.5">
            <span>{t("statusResolved")}</span>
            <span className="px-1.5 py-0.5 rounded-full bg-success-soft text-success font-mono tabular-nums text-[11px]">
              {counts.resolved}
            </span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="w-full lg:max-w-sm">
        <AdminSearchInput
          urlMode
          placeholder={t("searchPlaceholder")}
          ariaLabel={t("searchPlaceholder")}
          isLoading={isPending}
        />
      </div>
    </div>
  );
}
