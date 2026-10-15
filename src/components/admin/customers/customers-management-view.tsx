"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { GitMerge, UserCheck, Users, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/shared/page-header";
import { CustomerBlockDialog } from "./customer-block-dialog";
import { CustomerDetailsSheet } from "./details/customer-details-sheet";
import { exportCustomersCsv } from "./customers-export";
import { CustomerMergeDialog } from "./customer-merge-dialog";
import { CustomerResetDialog } from "./customer-reset-dialog";
import { CustomersTable } from "./customers-table";
import { CustomersTableToolbar } from "./customers-table-toolbar";
import { useCustomersFilter } from "./hooks/use-customers-filter";
import type { CustomerDetailsTab, CustomerRow } from "./types";

interface CustomersManagementViewProps {
  initialCustomers: CustomerRow[];
  totalCustomersCount: number;
  isAdmin: boolean;
}

export function CustomersManagementView({
  initialCustomers,
  totalCustomersCount,
  isAdmin,
}: CustomersManagementViewProps) {
  const router = useRouter();
  const t = useTranslations("admin.customers");

  // Filter & pagination hook
  const {
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    sortState,
    filters,
    setFilters,
    sortedCustomers,
    pagedCustomers,
    handleSortChange,
    handleResetFilters,
    registeredCount,
    guestCount,
  } = useCustomersFilter(initialCustomers);

  // Dialog and drawer state
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false);
  const [preselectedGuest, setPreselectedGuest] = useState<CustomerRow | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRow | null>(null);
  const [activeTab, setActiveTab] = useState<CustomerDetailsTab>("profile");
  const [customerToBlock, setCustomerToBlock] = useState<CustomerRow | null>(null);
  const [customerToReset, setCustomerToReset] = useState<CustomerRow | null>(null);

  const handleRefresh = () => {
    router.refresh();
  };

  const handleRowSelect = (customer: CustomerRow, tab: CustomerDetailsTab = "profile") => {
    setSelectedCustomer(customer);
    setActiveTab(tab);
  };

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        actions={
          <Button
            type="button"
            disabled={!isAdmin}
            onClick={() => {
              setPreselectedGuest(null);
              setMergeDialogOpen(true);
            }}
            className="min-h-[40px] px-4 text-xs font-bold bg-primary hover:bg-primary-hover text-white shadow-xs inline-flex items-center gap-2 border-2 border-primary"
            aria-label={t("mergeAccounts")}
          >
            <GitMerge className="size-4" />
            <span>{t("mergeAccounts")}</span>
          </Button>
        }
      >
        {/* KPI Badges */}
        <div className="flex items-center gap-2 pt-2 flex-wrap text-xs font-semibold">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-card border-2 border-border-strong text-ink-700">
            <Users className="size-3.5 text-primary" />
            <span>{t("kpiTotalBadge", { count: totalCustomersCount })}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-card border-2 border-border-strong text-ink-700">
            <UserCheck className="size-3.5 text-emerald-600" />
            <span>{t("kpiRegisteredBadge", { count: registeredCount })}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 border-2 border-amber-300 text-amber-800">
            <UserX className="size-3.5 text-amber-600" />
            <span>{t("kpiGuestBadge", { count: guestCount })}</span>
          </span>
        </div>
      </PageHeader>

      {/* Toolbar */}
      <CustomersTableToolbar
        filters={filters}
        onChange={(next) => {
          setFilters(next);
          setCurrentPage(1);
        }}
        onReset={handleResetFilters}
        onExport={() => exportCustomersCsv(sortedCustomers)}
        totalFiltered={sortedCustomers.length}
      />

      {/* Main Table */}
      <CustomersTable
        customers={pagedCustomers}
        totalItems={sortedCustomers.length}
        currentPage={currentPage}
        pageSize={pageSize}
        isAdmin={isAdmin}
        sortState={sortState}
        onSortChange={handleSortChange}
        onPageChange={setCurrentPage}
        onPageSizeChange={(sz) => {
          setPageSize(sz);
          setCurrentPage(1);
        }}
        onResetFilters={handleResetFilters}
        onSelectCustomer={(c) => handleRowSelect(c, "profile")}
        onViewProfile={(c) => handleRowSelect(c, "profile")}
        onViewOrders={(c) => handleRowSelect(c, "orders")}
        onResetPassword={(c) => setCustomerToReset(c)}
        onMergeGuest={(c) => {
          setPreselectedGuest(c);
          setMergeDialogOpen(true);
        }}
        onToggleBlock={(c) => setCustomerToBlock(c)}
      />

      {/* Slide-over Customer Details Sheet */}
      <CustomerDetailsSheet
        key={selectedCustomer ? `${selectedCustomer.id}-${activeTab}` : "none"}
        customer={selectedCustomer}
        initialTab={activeTab}
        onClose={() => setSelectedCustomer(null)}
      />

      {/* 4-Step Merge Wizard Dialog */}
      <CustomerMergeDialog
        isOpen={mergeDialogOpen}
        preselectedGuest={preselectedGuest}
        allCustomers={initialCustomers}
        onClose={() => {
          setMergeDialogOpen(false);
          setPreselectedGuest(null);
        }}
        onSuccess={handleRefresh}
      />

      {/* Block Confirmation Dialog */}
      <CustomerBlockDialog
        isOpen={Boolean(customerToBlock)}
        customer={customerToBlock}
        onClose={() => setCustomerToBlock(null)}
        onSuccess={handleRefresh}
      />

      {/* Password Reset Dialog */}
      <CustomerResetDialog
        isOpen={Boolean(customerToReset)}
        customer={customerToReset}
        onClose={() => setCustomerToReset(null)}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
