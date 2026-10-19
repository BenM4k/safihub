"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import type {
  PartnerOrderListItemDTO,
  PartnerOrderTab,
  PartnerOrderTabCounts,
} from "@/dal/partner-order.dal";
import {
  acceptPartnerOrderAction,
  getPartnerOrderTabCountsAction,
  handoverPartnerOrderToCourierAction,
  listPartnerOrdersAction,
  markPartnerOrderReadyAction,
  markPartnerOrderReceivedAction,
  rejectPartnerOrderAction,
  reportPartnerOrderIssueAction,
  startPartnerOrderWashingAction,
} from "@/actions/partner-orders.actions";

const VALID_TABS: PartnerOrderTab[] = [
  "to_accept",
  "to_collect",
  "in_treatment",
  "ready",
  "delivered",
  "failed",
];
const VALID_SORTS = ["deadline", "promised", "recent"] as const;

export function usePartnerOrders(
  initialOrders: PartnerOrderListItemDTO[],
  initialCounts: PartnerOrderTabCounts,
  houseSlug: string,
  customTranslator?: (key: string, params?: Record<string, string | number | boolean>) => string
) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultT = useTranslations("house.orders");
  const t = customTranslator ?? defaultT;

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

  const [orders, setOrders] = useState<PartnerOrderListItemDTO[]>(initialOrders);
  const [prevInitialOrders, setPrevInitialOrders] = useState<PartnerOrderListItemDTO[]>(initialOrders);
  const [counts, setCounts] = useState<PartnerOrderTabCounts>(initialCounts);
  const [prevInitialCounts, setPrevInitialCounts] = useState<PartnerOrderTabCounts>(initialCounts);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [feedbackToast, setFeedbackToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [, startTransition] = useTransition();

  const knownOrderIdsByTabRef = useRef<Map<PartnerOrderTab, Set<string>>>(
    new Map([[currentTab, new Set(initialOrders.map((o) => o.id))]])
  );
  const previousTabRef = useRef<PartnerOrderTab>(currentTab);
  const latestRequestIdRef = useRef(0);
  const isFirstRender = useRef(true);

  if (prevInitialOrders !== initialOrders) {
    setPrevInitialOrders(initialOrders);
    setOrders(initialOrders);
  }

  if (prevInitialCounts !== initialCounts) {
    setPrevInitialCounts(initialCounts);
    setCounts(initialCounts);
  }

  useEffect(() => {
    const existing = knownOrderIdsByTabRef.current.get(currentTab) ?? new Set();
    initialOrders.forEach((o) => existing.add(o.id));
    knownOrderIdsByTabRef.current.set(currentTab, existing);
  }, [initialOrders, currentTab]);

  const totalItems = counts[currentTab] ?? orders.length;
  const paginatedOrders = orders;

  function playAudioChime() {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch {
      // AudioContext unavailable or blocked
    }
  }

  function showNotification(title: string) {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      new Notification("SafiHub Pressing", { body: title });
    }
  }

  const fetchOrdersData = useCallback(
    async (
      tab: PartnerOrderTab,
      search: string,
      date: string,
      sort: "deadline" | "promised" | "recent",
      page: number,
      size: number,
      silent = false
    ) => {
      const requestId = ++latestRequestIdRef.current;
      if (!silent) setIsRefreshing(true);
      try {
        const [ordersRes, countsRes] = await Promise.all([
          listPartnerOrdersAction({
            houseSlug,
            tab,
            search: search || undefined,
            date: date || undefined,
            sort,
            page,
            pageSize: size,
          }),
          getPartnerOrderTabCountsAction({ houseSlug }),
        ]);

        if (requestId !== latestRequestIdRef.current) return;

        if (ordersRes.ok) {
          const tabKnown = knownOrderIdsByTabRef.current.get(tab) ?? new Set();
          const isSameTab = previousTabRef.current === tab;
          const newOrders = ordersRes.value.filter((o) => !tabKnown.has(o.id));

          if (isSameTab && newOrders.length > 0 && tab === "to_accept" && soundEnabled && !isFirstRender.current) {
            playAudioChime();
            showNotification(t("newOrderNotification", { code: newOrders[0].shortReference }));
          }

          ordersRes.value.forEach((o) => tabKnown.add(o.id));
          knownOrderIdsByTabRef.current.set(tab, tabKnown);
          previousTabRef.current = tab;
          setOrders(ordersRes.value);
        }

        if (countsRes.ok) {
          setCounts(countsRes.value);
        }
      } finally {
        if (!silent && requestId === latestRequestIdRef.current) {
          setIsRefreshing(false);
        }
      }
    },
    [houseSlug, soundEnabled, t]
  );

  const refreshData = useCallback(
    async (silent = false) => {
      await fetchOrdersData(currentTab, currentSearch, currentDate, currentSort, currentPage, pageSize, silent);
    },
    [fetchOrdersData, currentTab, currentSearch, currentDate, currentSort, currentPage, pageSize]
  );

  function updateUrl(params: {
    tab?: string;
    search?: string;
    date?: string;
    sort?: string;
    page?: number;
    pageSize?: number;
  }) {
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
  }

  function handlePageChange(newPage: number) {
    updateUrl({ page: newPage });
  }

  function handlePageSizeChange(newSize: number) {
    updateUrl({ pageSize: newSize, page: 1 });
  }

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    fetchOrdersData(currentTab, currentSearch, currentDate, currentSort, currentPage, pageSize, false);
  }, [fetchOrdersData, currentTab, currentSearch, currentDate, currentSort, currentPage, pageSize]);

  useEffect(() => {
    const timer = setInterval(() => {
      refreshData(true);
    }, 25000);
    return () => clearInterval(timer);
  }, [refreshData]);

  function showToast(message: string, type: "success" | "error" = "success") {
    setFeedbackToast({ message, type });
    setTimeout(() => setFeedbackToast(null), 4000);
  }

  async function handleAccept(orderId: string) {
    setPendingOrderId(orderId);
    startTransition(async () => {
      const res = await acceptPartnerOrderAction({ houseSlug, orderId });
      setPendingOrderId(null);
      if (res.ok) {
        showToast(t("acceptSuccess"));
        refreshData(true);
      } else {
        showToast(res.error, "error");
        refreshData(false);
      }
    });
  }

  async function handleReject(orderId: string, reason: string) {
    const res = await rejectPartnerOrderAction({ houseSlug, orderId, reason });
    if (res.ok) {
      showToast(t("rejectSuccess"));
      refreshData(true);
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
        refreshData(true);
      } else {
        showToast(res.error, "error");
        refreshData(false);
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
        refreshData(true);
      } else {
        showToast(res.error, "error");
        refreshData(false);
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
        refreshData(true);
      } else {
        showToast(res.error, "error");
        refreshData(false);
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
        refreshData(true);
      } else {
        showToast(res.error, "error");
        refreshData(false);
      }
    });
  }

  async function handleReportIssue(orderId: string, reason: string, note?: string) {
    const res = await reportPartnerOrderIssueAction({ houseSlug, orderId, reason, note });
    if (res.ok) {
      showToast(t("issueSuccess"));
      refreshData(true);
    } else {
      throw new Error(res.error);
    }
  }

  return {
    orders,
    paginatedOrders,
    currentPage,
    pageSize,
    totalItems,
    counts,
    currentTab,
    currentSearch,
    currentDate,
    currentSort,
    pendingOrderId,
    isRefreshing,
    soundEnabled,
    feedbackToast,
    setSoundEnabled,
    updateUrl,
    refreshData,
    handlePageChange,
    handlePageSizeChange,
    handleAccept,
    handleReject,
    handleMarkReceived,
    handleStartWashing,
    handleMarkReady,
    handleHandover,
    handleReportIssue,
  };
}
