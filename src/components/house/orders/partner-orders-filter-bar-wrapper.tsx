"use client";

import { usePartnerOrdersActions } from "./partner-orders-context";
import { PartnerOrdersFilterBar } from "./partner-orders-filter-bar";

export function PartnerOrdersFilterBarWrapper() {
  const {
    currentSearch,
    currentDate,
    currentSort,
    soundEnabled,
    isRefreshing,
    handleSearchChange,
    handleDateChange,
    handleSortChange,
    setSoundEnabled,
    handleRefresh,
  } = usePartnerOrdersActions();

  return (
    <PartnerOrdersFilterBar
      search={currentSearch}
      onSearchChange={handleSearchChange}
      date={currentDate}
      onDateChange={handleDateChange}
      sort={currentSort}
      onSortChange={handleSortChange}
      soundEnabled={soundEnabled}
      onToggleSound={() => setSoundEnabled((prev) => !prev)}
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
    />
  );
}

