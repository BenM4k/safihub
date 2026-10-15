"use client";

import { useState } from "react";
import { HouseDetailsHeader } from "./house-details-header";
import { HouseTabInfo } from "./house-tab-info";
import { HouseTabSettings } from "./house-tab-settings";
import { HouseTabOrders } from "./house-tab-orders";
import { HouseTabSettlements } from "./house-tab-settlements";
import { HouseTabHistory } from "./house-tab-history";
import type { AdminHouseRow } from "../types";

export type HouseDetailsTab = "info" | "settings" | "orders" | "settlements" | "history";

interface HouseDetailsSheetProps {
  house: AdminHouseRow | null;
  onClose: () => void;
  defaultCommissionBps: number;
  onToggleStatus: (house: AdminHouseRow) => void;
  onRefresh: () => void;
  initialTab?: HouseDetailsTab;
}

export function HouseDetailsSheet({
  house,
  onClose,
  defaultCommissionBps,
  onToggleStatus,
  onRefresh,
  initialTab = "info",
}: HouseDetailsSheetProps) {
  const [activeTab, setActiveTab] = useState<HouseDetailsTab>(initialTab);

  if (!house) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="house-sheet-title"
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg bg-card h-full shadow-2xl border-l-2 border-border-strong flex flex-col animate-in slide-in-from-right duration-200">
        <HouseDetailsHeader house={house} onClose={onClose} />

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 border-b-2 border-border-strong bg-surface px-4 py-2 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab("info")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
              activeTab === "info"
                ? "bg-primary text-white shadow-2xs"
                : "text-ink-600 hover:text-heading hover:bg-surface-hover"
            }`}
          >
            Informations
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
              activeTab === "settings"
                ? "bg-primary text-white shadow-2xs"
                : "text-ink-600 hover:text-heading hover:bg-surface-hover"
            }`}
          >
            Paramètres
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "orders"
                ? "bg-primary text-white shadow-2xs"
                : "text-ink-600 hover:text-heading hover:bg-surface-hover"
            }`}
          >
            <span>Commandes</span>
            {house.activeOrdersCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === "orders" ? "bg-white text-primary" : "bg-primary-soft text-primary"
              }`}>
                {house.activeOrdersCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("settlements")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
              activeTab === "settlements"
                ? "bg-primary text-white shadow-2xs"
                : "text-ink-600 hover:text-heading hover:bg-surface-hover"
            }`}
          >
            Règlements
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
              activeTab === "history"
                ? "bg-primary text-white shadow-2xs"
                : "text-ink-600 hover:text-heading hover:bg-surface-hover"
            }`}
          >
            Historique
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === "info" && (
            <HouseTabInfo
              house={house}
              onToggleStatus={() => onToggleStatus(house)}
            />
          )}

          {activeTab === "settings" && (
            <HouseTabSettings
              house={house}
              defaultCommissionBps={defaultCommissionBps}
              onSuccess={onRefresh}
            />
          )}

          {activeTab === "orders" && <HouseTabOrders house={house} />}

          {activeTab === "settlements" && <HouseTabSettlements house={house} />}

          {activeTab === "history" && <HouseTabHistory house={house} />}
        </div>
      </div>
    </div>
  );
}
