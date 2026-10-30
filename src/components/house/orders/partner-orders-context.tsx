"use client";

import { createContext, useContext } from "react";
import type { PartnerOrderListItemDTO, PartnerOrderTab } from "@/dal/partner-order.dal";

export interface PartnerOrdersActionsContextValue {
  currentTab: PartnerOrderTab;
  currentSearch: string;
  currentDate: string;
  currentSort: "deadline" | "promised" | "recent";
  currentPage: number;
  pageSize: number;
  soundEnabled: boolean;
  isRefreshing: boolean;
  pendingOrderId: string | null;

  setSoundEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  setDetailOrder: (order: PartnerOrderListItemDTO | null) => void;
  setTicketOrder: (order: PartnerOrderListItemDTO | null) => void;
  setRejectOrder: (order: PartnerOrderListItemDTO | null) => void;
  setIssueOrder: (order: PartnerOrderListItemDTO | null) => void;

  handleTabChange: (tab: PartnerOrderTab) => void;
  handleSearchChange: (search: string) => void;
  handleDateChange: (date: string) => void;
  handleSortChange: (sort: "deadline" | "promised" | "recent") => void;
  handlePageChange: (page: number) => void;
  handlePageSizeChange: (size: number) => void;
  handleRefresh: () => void;
  notifyOrders: (orderIds: string[]) => void;

  handleAccept: (orderId: string) => Promise<void>;
  handleReject: (orderId: string, reason: string) => Promise<void>;
  handleMarkReceived: (orderId: string) => Promise<void>;
  handleStartWashing: (orderId: string) => Promise<void>;
  handleMarkReady: (orderId: string) => Promise<void>;
  handleHandover: (orderId: string) => Promise<void>;
  handleReportIssue: (orderId: string, reason: string, note?: string) => Promise<void>;
}

export const PartnerOrdersActionsContext =
  createContext<PartnerOrdersActionsContextValue | null>(null);

export function usePartnerOrdersActions(): PartnerOrdersActionsContextValue {
  const ctx = useContext(PartnerOrdersActionsContext);
  if (!ctx) {
    throw new Error(
      "usePartnerOrdersActions must be used within a PartnerOrdersInteractive provider"
    );
  }
  return ctx;
}

