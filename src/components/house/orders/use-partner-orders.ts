"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

export function usePartnerOrders(
  initialOrders: PartnerOrderListItemDTO[],
  initialCounts: PartnerOrderTabCounts,
  houseSlug: string
) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentTab = (searchParams.get("tab") as PartnerOrderTab) || "to_accept";
  const currentSearch = searchParams.get("search") || "";
  const currentDate = searchParams.get("date") || "";
  const currentSort = (searchParams.get("sort") as "deadline" | "promised" | "recent") || "promised";

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
  const previousOrderIdsRef = useRef<Set<string>>(new Set(initialOrders.map((o) => o.id)));

  const isFirstRender = useRef(true);

  // Sync state if server passes updated initialOrders or initialCounts
  if (prevInitialOrders !== initialOrders) {
    setPrevInitialOrders(initialOrders);
    setOrders(initialOrders);
  }

  if (prevInitialCounts !== initialCounts) {
    setPrevInitialCounts(initialCounts);
    setCounts(initialCounts);
  }

  useEffect(() => {
    previousOrderIdsRef.current = new Set(initialOrders.map((o) => o.id));
  }, [initialOrders]);

  // Derived paginated slice
  const totalItems = orders.length;
  const paginatedOrders = orders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Audio & Notification helpers
  function playAudioChime() {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
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

  // Core fetcher for explicit filters
  const fetchOrdersData = useCallback(
    async (
      tab: PartnerOrderTab,
      search: string,
      date: string,
      sort: "deadline" | "promised" | "recent",
      silent = false
    ) => {
      if (!silent) setIsRefreshing(true);
      try {
        const [ordersRes, countsRes] = await Promise.all([
          listPartnerOrdersAction({
            houseSlug,
            tab,
            search: search || undefined,
            date: date || undefined,
            sort,
          }),
          getPartnerOrderTabCountsAction({ houseSlug }),
        ]);

        if (ordersRes.ok) {
          // Detect new orders
          const newOrders = ordersRes.value.filter((o) => !previousOrderIdsRef.current.has(o.id));
          if (newOrders.length > 0 && tab === "to_accept" && soundEnabled && !isFirstRender.current) {
            playAudioChime();
            showNotification(`Nouvelle commande : ${newOrders[0].shortReference}`);
          }
          previousOrderIdsRef.current = new Set(ordersRes.value.map((o) => o.id));
          setOrders(ordersRes.value);
        }

        if (countsRes.ok) {
          setCounts(countsRes.value);
        }
      } finally {
        if (!silent) setIsRefreshing(false);
      }
    },
    [houseSlug, soundEnabled]
  );

  // Refetch orders & counts preserving scroll
  const refreshData = useCallback(
    async (silent = false) => {
      await fetchOrdersData(currentTab, currentSearch, currentDate, currentSort, silent);
    },
    [fetchOrdersData, currentTab, currentSearch, currentDate, currentSort]
  );

  // Sync state with URL params and immediately refresh data
  function updateUrl(params: {
    tab?: string;
    search?: string;
    date?: string;
    sort?: string;
    page?: number;
    pageSize?: number;
  }) {
    const nextParams = new URLSearchParams(searchParams.toString());
    const nextTab = (params.tab !== undefined ? params.tab : currentTab) as PartnerOrderTab;
    const nextSearch = params.search !== undefined ? params.search : currentSearch;
    const nextDate = params.date !== undefined ? params.date : currentDate;
    const nextSort = (params.sort !== undefined ? params.sort : currentSort) as "deadline" | "promised" | "recent";

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
    // When changing filters without explicit page, reset page to 1
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

    // Immediately fetch new data without waiting for manual refresh
    fetchOrdersData(nextTab, nextSearch, nextDate, nextSort, false);
  }

  function handlePageChange(newPage: number) {
    updateUrl({ page: newPage });
  }

  function handlePageSizeChange(newSize: number) {
    updateUrl({ pageSize: newSize, page: 1 });
  }

  // Automatic refresh on browser history navigation (back/forward)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    fetchOrdersData(currentTab, currentSearch, currentDate, currentSort, false);
  }, [fetchOrdersData, currentTab, currentSearch, currentDate, currentSort]);

  // Polling every 25 seconds
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

  // Action handlers
  async function handleAccept(orderId: string) {
    setPendingOrderId(orderId);
    startTransition(async () => {
      const res = await acceptPartnerOrderAction({ houseSlug, orderId });
      setPendingOrderId(null);
      if (res.ok) {
        showToast("Commande acceptée avec succès");
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
      showToast("Commande refusée");
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
        showToast("Linge réceptionné au pressing");
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
        showToast("Traitement démarré");
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
        showToast("Commande marquée comme prête");
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
        showToast("Remise au coursier enregistrée");
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
      showToast("Signalement transmis avec succès");
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
