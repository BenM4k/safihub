"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import type { PartnerOrderListItemDTO, PartnerOrderTab } from "@/dal/partner-order.dal";
import {
  acceptPartnerOrderAction,
  handoverPartnerOrderToCourierAction,
  markPartnerOrderReadyAction,
  markPartnerOrderReceivedAction,
  rejectPartnerOrderAction,
  reportPartnerOrderIssueAction,
  startPartnerOrderWashingAction,
} from "@/actions/partner-orders.actions";
import { PartnerOrderDetailSheet } from "./partner-order-detail-sheet";
import { PartnerOrderRejectDialog } from "./partner-order-reject-dialog";
import { PartnerOrderIssueDialog } from "./partner-order-issue-dialog";
import { PartnerOrderTicketDialog } from "./partner-order-ticket-dialog";
import {
  PartnerOrdersActionsContext,
  type PartnerOrdersActionsContextValue,
} from "./partner-orders-context";

const VALID_TABS: PartnerOrderTab[] = [
  "to_accept",
  "to_collect",
  "in_treatment",
  "ready",
  "delivered",
  "failed",
];
const VALID_SORTS = ["deadline", "promised", "recent"] as const;

export function PartnerOrdersInteractive({
  houseSlug,
  children,
}: {
  houseSlug: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("house.orders");

  const rawTab = searchParams.get("tab");
  const currentTab: PartnerOrderTab = VALID_TABS.includes(rawTab as PartnerOrderTab)
    ? (rawTab as PartnerOrderTab)
    : "to_accept";

  const currentSearch = searchParams.get("search") || "";
  const currentDate = searchParams.get("date") || "";

  const rawSort = searchParams.get("sort");
  const currentSort = VALID_SORTS.includes(rawSort as (typeof VALID_SORTS)[number])
    ? (rawSort as (typeof VALID_SORTS)[number])
    : "promised";

  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const currentPage = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  const pageSizeParam = parseInt(searchParams.get("pageSize") || "10", 10);
  const pageSize = [10, 20, 50].includes(pageSizeParam) ? pageSizeParam : 10;

  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [feedbackToast, setFeedbackToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [detailOrder, setDetailOrder] = useState<PartnerOrderListItemDTO | null>(null);
  const [ticketOrder, setTicketOrder] = useState<PartnerOrderListItemDTO | null>(null);
  const [rejectOrder, setRejectOrder] = useState<PartnerOrderListItemDTO | null>(null);
  const [issueOrder, setIssueOrder] = useState<PartnerOrderListItemDTO | null>(null);

  const [, startTransition] = useTransition();

  function showToast(message: string, type: "success" | "error" = "success") {
    setFeedbackToast({ message, type });
    setTimeout(() => setFeedbackToast(null), 4000);
  }

  const updateUrl = useCallback(
    (params: {
      tab?: string;
      search?: string;
      date?: string;
      sort?: string;
      page?: number;
      pageSize?: number;
    }) => {
      const nextParams = new URLSearchParams(searchParams.toString());

      if (params.tab !== undefined) {
        if (params.tab === "to_accept") nextParams.delete("tab");
        else nextParams.set("tab", params.tab);
      }
      if (params.search !== undefined) {
        if (!params.search) nextParams.delete("search");
        else nextParams.set("search", params.search);
      }
      if (params.date !== undefined) {
        if (!params.date) nextParams.delete("date");
        else nextParams.set("date", params.date);
      }
      if (params.sort !== undefined) {
        if (params.sort === "promised") nextParams.delete("sort");
        else nextParams.set("sort", params.sort);
      }
      if (params.page !== undefined) {
        if (params.page <= 1) nextParams.delete("page");
        else nextParams.set("page", String(params.page));
      }
      if (params.pageSize !== undefined) {
        if (params.pageSize === 10) nextParams.delete("pageSize");
        else nextParams.set("pageSize", String(params.pageSize));
      }
      if (
        (params.tab !== undefined ||
          params.search !== undefined ||
          params.date !== undefined ||
          params.sort !== undefined) &&
        params.page === undefined
      ) {
        nextParams.delete("page");
      }

      router.replace(`?${nextParams.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    startTransition(() => {
      router.refresh();
      setIsRefreshing(false);
    });
  }, [router]);

  // Periodic polling every 30s
  useEffect(() => {
    const timer = setInterval(() => {
      router.refresh();
    }, 30000);
    return () => clearInterval(timer);
  }, [router]);

  async function handleAccept(orderId: string) {
    setPendingOrderId(orderId);
    startTransition(async () => {
      const res = await acceptPartnerOrderAction({ houseSlug, orderId });
      setPendingOrderId(null);
      if (res.ok) {
        showToast(t("acceptSuccess"));
        router.refresh();
      } else {
        showToast(res.error, "error");
      }
    });
  }

  async function handleReject(orderId: string, reason: string) {
    const res = await rejectPartnerOrderAction({ houseSlug, orderId, reason });
    if (res.ok) {
      showToast(t("rejectSuccess"));
      router.refresh();
    } else {
      throw new Error(res.error);
    }
  }

  async function handleMarkReceived(orderId: string) {
    setPendingOrderId(orderId);
    startTransition(async () => {
      const res = await markPartnerOrderReceivedAction({ houseSlug, orderId });
      setPendingOrderId(null);
      if (res.ok) {
        showToast(t("markReceivedSuccess"));
        router.refresh();
      } else {
        showToast(res.error, "error");
      }
    });
  }

  async function handleStartWashing(orderId: string) {
    setPendingOrderId(orderId);
    startTransition(async () => {
      const res = await startPartnerOrderWashingAction({ houseSlug, orderId });
      setPendingOrderId(null);
      if (res.ok) {
        showToast(t("startWashingSuccess"));
        router.refresh();
      } else {
        showToast(res.error, "error");
      }
    });
  }

  async function handleMarkReady(orderId: string) {
    setPendingOrderId(orderId);
    startTransition(async () => {
      const res = await markPartnerOrderReadyAction({ houseSlug, orderId });
      setPendingOrderId(null);
      if (res.ok) {
        showToast(t("markReadySuccess"));
        router.refresh();
      } else {
        showToast(res.error, "error");
      }
    });
  }

  async function handleHandover(orderId: string) {
    setPendingOrderId(orderId);
    startTransition(async () => {
      const res = await handoverPartnerOrderToCourierAction({ houseSlug, orderId });
      setPendingOrderId(null);
      if (res.ok) {
        showToast(t("handoverSuccess"));
        router.refresh();
      } else {
        showToast(res.error, "error");
      }
    });
  }

  async function handleReportIssue(orderId: string, reason: string, note?: string) {
    const res = await reportPartnerOrderIssueAction({
      houseSlug,
      orderId,
      reason,
      note,
    });
    if (res.ok) {
      showToast(t("issueSuccess"));
      router.refresh();
    } else {
      throw new Error(res.error);
    }
  }

  const contextValue: PartnerOrdersActionsContextValue = {
    currentTab,
    currentSearch,
    currentDate,
    currentSort,
    currentPage,
    pageSize,
    soundEnabled,
    isRefreshing,
    pendingOrderId,
    setSoundEnabled,
    setDetailOrder,
    setTicketOrder,
    setRejectOrder,
    setIssueOrder,
    handleTabChange: (tab) => updateUrl({ tab }),
    handleSearchChange: (search) => updateUrl({ search }),
    handleDateChange: (date) => updateUrl({ date }),
    handleSortChange: (sort) => updateUrl({ sort }),
    handlePageChange: (page) => updateUrl({ page }),
    handlePageSizeChange: (size) => updateUrl({ pageSize: size, page: 1 }),
    handleRefresh,
    handleAccept,
    handleReject,
    handleMarkReceived,
    handleStartWashing,
    handleMarkReady,
    handleHandover,
    handleReportIssue,
  };

  return (
    <PartnerOrdersActionsContext.Provider value={contextValue}>
      <div className="space-y-4 font-sans">
        {/* Toast Feedback */}
        {feedbackToast && (
          <div
            role="status"
            aria-live="polite"
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl text-xs font-bold shadow-2xl flex items-center gap-2 border animate-in fade-in slide-in-from-bottom-2 ${
              feedbackToast.type === "success"
                ? "bg-popover text-popover-foreground border-border"
                : "bg-destructive text-white border-destructive"
            }`}
          >
            {feedbackToast.type === "success" ? (
              <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
            ) : (
              <AlertCircle className="size-4 text-white shrink-0" />
            )}
            <span>{feedbackToast.message}</span>
          </div>
        )}

        {children}

        {/* Dialogs */}
        <PartnerOrderDetailSheet
          order={detailOrder}
          houseSlug={houseSlug}
          isOpen={Boolean(detailOrder)}
          onClose={() => setDetailOrder(null)}
        />

        <PartnerOrderTicketDialog
          order={ticketOrder}
          isOpen={Boolean(ticketOrder)}
          onClose={() => setTicketOrder(null)}
        />

        <PartnerOrderRejectDialog
          order={rejectOrder}
          isOpen={Boolean(rejectOrder)}
          onClose={() => setRejectOrder(null)}
          onConfirm={handleReject}
        />

        <PartnerOrderIssueDialog
          order={issueOrder}
          isOpen={Boolean(issueOrder)}
          onClose={() => setIssueOrder(null)}
          onConfirm={handleReportIssue}
        />
      </div>
    </PartnerOrdersActionsContext.Provider>
  );
}

