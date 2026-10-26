"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { AlertCircle, GitMerge, UserCheck, Users, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
            size="sm"
            className="text-xs font-semibold inline-flex items-center gap-2"
            aria-label={t("mergeAccounts")}
          >
            <GitMerge className="size-4" />
            <span>{t("mergeAccounts")}</span>
          </Button>
        }
      >
        {/* KPI Badges */}
        <div className="flex items-center gap-2 pt-2 flex-wrap text-xs font-medium">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-muted/60 border border-border text-foreground">
            <Users className="size-3.5 text-primary" />
            <span>{t("kpiTotalBadge", { count: totalCustomersCount })}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-muted/60 border border-border text-foreground">
            <UserCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{t("kpiRegisteredBadge", { count: registeredCount })}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400">
            <UserX className="size-3.5 text-amber-600 dark:text-amber-400" />
            <span>{t("kpiGuestBadge", { count: guestCount })}</span>
          </span>
        </div>
      </PageHeader>

      {/* Truncation notice if loaded set is capped */}
      {totalCustomersCount > initialCustomers.length && (
        <Alert>
          <AlertCircle className="size-4" />
          <AlertDescription>
            {t("truncationNotice", {
              loaded: initialCustomers.length,
              total: totalCustomersCount,
            })}
          </AlertDescription>
        </Alert>
      )}

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
        onPageSizeChange={(sz) => { setPageSize(sz); setCurrentPage(1); }}
        onResetFilters={handleResetFilters}
        onSelectCustomer={(c) => handleRowSelect(c, "profile")}
        onViewProfile={(c) => handleRowSelect(c, "profile")}
        onViewOrders={(c) => handleRowSelect(c, "orders")}
        onResetPassword={(c) => setCustomerToReset(c)}
        onMergeGuest={(c) => { setPreselectedGuest(c); setMergeDialogOpen(true); }}
        onToggleBlock={(c) => setCustomerToBlock(c)}
      />

      {/* Slide-over Customer Details Sheet */}
      <CustomerDetailsSheet
        key={selectedCustomer ? `${selectedCustomer.id}-${activeTab}` : "details-closed"}
        customer={selectedCustomer}
        initialTab={activeTab}
        onClose={() => setSelectedCustomer(null)}
      />

      {/* 4-Step Merge Wizard Dialog */}
      {mergeDialogOpen && (
        <CustomerMergeDialog
          key={`merge-${preselectedGuest?.id || "manual"}`}
          isOpen={mergeDialogOpen}
          preselectedGuest={preselectedGuest}
          allCustomers={initialCustomers}
          onClose={() => { setMergeDialogOpen(false); setPreselectedGuest(null); }}
          onSuccess={handleRefresh}
        />
      )}

      {/* Block Confirmation Dialog */}
      <CustomerBlockDialog
        key={customerToBlock ? `block-${customerToBlock.id}` : "block-closed"}
        isOpen={Boolean(customerToBlock)}
        customer={customerToBlock}
        onClose={() => setCustomerToBlock(null)}
        onSuccess={handleRefresh}
      />

      {/* Password Reset Dialog */}
      <CustomerResetDialog
        key={customerToReset ? `reset-${customerToReset.id}` : "reset-closed"}
        isOpen={Boolean(customerToReset)}
        customer={customerToReset}
        onClose={() => setCustomerToReset(null)}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
