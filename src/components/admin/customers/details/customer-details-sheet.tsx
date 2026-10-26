"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { History, Home, ShoppingBag, User } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getCustomerDetailsAction } from "@/actions/admin-customer.actions";
import { formatCustomerName } from "@/lib/customer-formatters";
import type { CustomerDetailedProfile } from "@/services/admin";
import type { CustomerDetailsTab, CustomerRow } from "../types";
import { CustomerTabAddresses } from "./customer-tab-addresses";
import { CustomerTabHistory } from "./customer-tab-history";
import { CustomerTabOrders } from "./customer-tab-orders";
import { CustomerTabProfile } from "./customer-tab-profile";

interface CustomerDetailsSheetProps {
  customer: CustomerRow | null;
  onClose: () => void;
  initialTab?: CustomerDetailsTab;
}

export function CustomerDetailsSheet({
  customer,
  onClose,
  initialTab = "profile",
}: CustomerDetailsSheetProps) {
  const t = useTranslations("admin.customers.details");
  const [activeTab, setActiveTab] = useState<CustomerDetailsTab>(initialTab);
  const [profile, setProfile] = useState<CustomerDetailedProfile | null>(null);
  const [loading, setLoading] = useState(Boolean(customer));
  const [error, setError] = useState<string | null>(null);

  const [prevCustomerId, setPrevCustomerId] = useState(customer?.id);
  if (customer?.id !== prevCustomerId) {
    setPrevCustomerId(customer?.id);
    setProfile(null);
    setLoading(Boolean(customer));
    setError(null);
  }

  useEffect(() => {
    if (!customer) return;

    let isMounted = true;

    getCustomerDetailsAction(customer.id)
      .then((res) => {
        if (!isMounted) return;
        if (res.ok) {
          setProfile(res.value);
        } else {
          setError(res.error || t("fallbackError"));
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : t("fallbackError"));
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [customer, t]);

  if (!customer) return null;

  const displayName = formatCustomerName(customer.name, customer.contactPhone);
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Sheet open={Boolean(customer)} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-lg h-full p-0 flex flex-col border-l border-border bg-background"
      >
        {/* Header */}
        <SheetHeader className="flex flex-row items-center gap-3.5 px-6 py-4 border-b border-border bg-muted/20 shrink-0 space-y-0 text-left">
          <div className="size-11 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-sm flex items-center justify-center shrink-0">
            {initials || "C"}
          </div>
          <div className="flex-1 min-w-0">
            <SheetTitle className="text-lg font-bold text-foreground truncate leading-tight">
              {displayName}
            </SheetTitle>
            <div className="mt-1 flex items-center gap-2">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  customer.isGuest
                    ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                    : "bg-primary/10 text-primary border border-primary/20"
                }`}
              >
                {customer.isGuest ? t("guestAccount") : t("registeredAccount")}
              </span>
              <span className="text-2xs text-muted-foreground font-mono truncate">
                ID: {customer.id.slice(0, 8)}...
              </span>
            </div>
          </div>
        </SheetHeader>

        {/* Tabs & Content */}
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as CustomerDetailsTab)}
          className="flex-1 flex flex-col min-h-0 gap-0"
        >
          <div className="px-6 pt-3 pb-0 shrink-0 border-b border-border">
            <TabsList className="h-auto p-0 gap-6 bg-transparent border-0 rounded-none justify-start">
              <TabsTrigger
                value="profile"
                className="h-auto p-0 pb-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground border-0 data-[state=active]:!text-primary data-[state=active]:!bg-transparent data-[state=active]:!shadow-none after:!hidden rounded-none gap-1.5 cursor-pointer"
              >
                <User className="size-3.5" />
                <span>{t("tabProfile")}</span>
              </TabsTrigger>

              <TabsTrigger
                value="orders"
                className="h-auto p-0 pb-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground border-0 data-[state=active]:!text-primary data-[state=active]:!bg-transparent data-[state=active]:!shadow-none after:!hidden rounded-none gap-1.5 cursor-pointer"
              >
                <ShoppingBag className="size-3.5" />
                <span>{t("tabOrders")}</span>
                {customer.ordersCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-primary/10 text-primary">
                    {customer.ordersCount}
                  </span>
                )}
              </TabsTrigger>

              <TabsTrigger
                value="addresses"
                className="h-auto p-0 pb-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground border-0 data-[state=active]:!text-primary data-[state=active]:!bg-transparent data-[state=active]:!shadow-none after:!hidden rounded-none gap-1.5 cursor-pointer"
              >
                <Home className="size-3.5" />
                <span>{t("tabAddresses")}</span>
              </TabsTrigger>

              <TabsTrigger
                value="history"
                className="h-auto p-0 pb-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground border-0 data-[state=active]:!text-primary data-[state=active]:!bg-transparent data-[state=active]:!shadow-none after:!hidden rounded-none gap-1.5 cursor-pointer"
              >
                <History className="size-3.5" />
                <span>{t("tabHistory")}</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5">
            {loading ? (
              <div className="p-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                <span className="size-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <span>{t("loading")}</span>
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : profile ? (
              <>
                <TabsContent value="profile" className="m-0 focus-visible:outline-hidden">
                  <CustomerTabProfile profile={profile} />
                </TabsContent>
                <TabsContent value="orders" className="m-0 focus-visible:outline-hidden">
                  <CustomerTabOrders profile={profile} />
                </TabsContent>
                <TabsContent value="addresses" className="m-0 focus-visible:outline-hidden">
                  <CustomerTabAddresses profile={profile} />
                </TabsContent>
                <TabsContent value="history" className="m-0 focus-visible:outline-hidden">
                  <CustomerTabHistory profile={profile} />
                </TabsContent>
              </>
            ) : null}
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
