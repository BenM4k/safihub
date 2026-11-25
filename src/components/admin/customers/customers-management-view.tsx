"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { AlertCircle, GitMerge, UserCheck, Users, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PageHeader } from "@/components/admin/shared/page-header";
import { exportCustomersCsv } from "./customers-export";
import { CustomersTable } from "./customers-table";
import { CustomersTableToolbar } from "./customers-table-toolbar";
import { useCustomersUrlState } from "./hooks/use-customers-url-state";
import type { AdminCustomersUrlState } from "@/lib/admin-customers-query";
import type { CustomerDetailsTab, CustomerRow } from "./types";

const CustomerDetailsSheet = dynamic(
  () =>
    import("./details/customer-details-sheet").then(
      (m) => m.CustomerDetailsSheet
    ),
  { ssr: false }
);

const CustomerMergeDialog = dynamic(
  () =>
    import("./customer-merge-dialog").then((m) => m.CustomerMergeDialog),
  { ssr: false }
);

const CustomerBlockDialog = dynamic(
  () =>
    import("./customer-block-dialog").then((m) => m.CustomerBlockDialog),
  { ssr: false }
);

const CustomerResetDialog = dynamic(
  () =>
    import("./customer-reset-dialog").then((m) => m.CustomerResetDialog),
  { ssr: false }
);

interface CustomersManagementViewProps {
  initialCustomers: CustomerRow[];
  totalCustomersCount: number;
  isAdmin: boolean;
  initialUrlState?: AdminCustomersUrlState;
}

export function CustomersManagementView({
  initialCustomers,
  totalCustomersCount,
  isAdmin,
  initialUrlState,
}: CustomersManagementViewProps) {
  const t = useTranslations("admin.customers");
  const {
    currentPage,
    pageSize,
    sortState,
    filters,
    sortedCustomers,
    pagedCustomers,
    handleSortChange,
    registeredCount,
    guestCount,
    isPending,
    handleFiltersUpdate,
    handleResetAll,
    handlePageChange,
    handlePageSizeChange,
    handleRefresh,
  } = useCustomersUrlState(initialCustomers, initialUrlState);

  const [mergeDialogOpen, setMergeDialogOpen] = useState(false);
  const [preselectedGuest, setPreselectedGuest] = useState<CustomerRow | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRow | null>(null);
  const [activeTab, setActiveTab] = useState<CustomerDetailsTab>("profile");
  const [customerToBlock, setCustomerToBlock] = useState<CustomerRow | null>(null);
  const [customerToReset, setCustomerToReset] = useState<CustomerRow | null>(null);

  const handleRowSelect = (
    customer: CustomerRow,
    tab: CustomerDetailsTab = "profile"
  ) => {
    setSelectedCustomer(customer);
    setActiveTab(tab);
  };

  return (
    <div className="space-y-5 animate-enter">
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
            className="min-h-10 text-xs font-semibold inline-flex items-center gap-2 press"
            aria-label={t("mergeAccounts")}
          >
            <GitMerge className="size-4" />
            <span>{t("mergeAccounts")}</span>
          </Button>
        }
      >
        <div className="flex items-center gap-2 pt-2 flex-wrap text-xs font-medium">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-muted/60 border border-border text-foreground">
            <Users className="size-3.5 text-primary" />
            <span>{t("kpiTotalBadge", { count: totalCustomersCount })}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-muted/60 border border-border text-foreground">
            <UserCheck className="size-3.5 text-success" />
            <span>{t("kpiRegisteredBadge", { count: registeredCount })}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-warning-soft border border-warning/20 text-warning">
            <UserX className="size-3.5 text-warning" />
            <span>{t("kpiGuestBadge", { count: guestCount })}</span>
          </span>
        </div>
      </PageHeader>

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

      <CustomersTableToolbar
        filters={filters}
        onChange={handleFiltersUpdate}
        onReset={handleResetAll}
        onExport={() => exportCustomersCsv(sortedCustomers)}
        totalFiltered={sortedCustomers.length}
        isPending={isPending}
      />

      <CustomersTable
        customers={pagedCustomers}
        totalItems={sortedCustomers.length}
        currentPage={currentPage}
        pageSize={pageSize}
        isAdmin={isAdmin}
        sortState={sortState}
        onSortChange={handleSortChange}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onResetFilters={handleResetAll}
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

      {selectedCustomer && (
        <CustomerDetailsSheet
          key={`${selectedCustomer.id}-${activeTab}`}
          customer={selectedCustomer}
          initialTab={activeTab}
          onClose={() => setSelectedCustomer(null)}
        />
      )}

      {mergeDialogOpen && (
        <CustomerMergeDialog
          key={`merge-${preselectedGuest?.id || "manual"}`}
          isOpen
          preselectedGuest={preselectedGuest}
          allCustomers={initialCustomers}
          onClose={() => {
            setMergeDialogOpen(false);
            setPreselectedGuest(null);
          }}
          onSuccess={handleRefresh}
        />
      )}

      {customerToBlock && (
        <CustomerBlockDialog
          key={`block-${customerToBlock.id}`}
          isOpen
          customer={customerToBlock}
          onClose={() => setCustomerToBlock(null)}
          onSuccess={handleRefresh}
        />
      )}

      {customerToReset && (
        <CustomerResetDialog
          key={`reset-${customerToReset.id}`}
          isOpen
          customer={customerToReset}
          onClose={() => setCustomerToReset(null)}
          onSuccess={handleRefresh}
        />
      )}
    </div>
  );
}
