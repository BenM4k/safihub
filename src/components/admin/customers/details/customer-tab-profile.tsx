"use client";

import { useTranslations } from "next-intl";
import { Calendar, DollarSign, Mail, Phone, ShoppingBag, Sparkles } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { PhoneCell } from "@/components/admin/shared/phone-cell";
import { StatusPill } from "@/components/admin/shared/status-pill";
import { formatCustomerEmail, formatCustomerName, isTestCustomer } from "@/lib/customer-formatters";
import { formatAmount, formatDateTime, formatRelativeTime, getSourceConfig } from "@/lib/order-formatters";
import type { CustomerDetailedProfile } from "@/services/admin";

interface CustomerTabProfileProps {
  profile: CustomerDetailedProfile;
}

export function CustomerTabProfile({ profile }: CustomerTabProfileProps) {
  const t = useTranslations("admin.customers.details");
  const { customer } = profile;
  const isGuest = customer.isGuest;
  const isBlocked = customer.banned || customer.status === "blocked";
  const isTest = isTestCustomer(customer);
  const displayName = formatCustomerName(customer.name, customer.contactPhone);
  const displayEmail = formatCustomerEmail(customer.email);
  const sourceConfig = getSourceConfig(customer.firstOrderSource || (isGuest ? "phone" : "app"));

  return (
    <div className="space-y-4 text-xs">
      {/* Identity info */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="font-bold text-sm text-foreground">{displayName}</div>
          <div className="flex items-center gap-1.5">
            {isGuest ? (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400">
                {t("badgeGuest")}
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                {t("badgeRegistered")}
              </span>
            )}
            {isBlocked ? (
              <StatusPill status="blocked" customLabel={t("badgeBlocked")} title={customer.banReason || undefined} />
            ) : (
              <StatusPill status="active" customLabel={t("badgeActive")} />
            )}
          </div>
        </div>

        {isTest && (
          <div className="p-2 rounded-md bg-muted text-2xs text-muted-foreground font-semibold flex items-center gap-1.5">
            <Sparkles className="size-3 text-amber-600 dark:text-amber-400" />
            <span>{t("badgeTestAccount")}</span>
          </div>
        )}

        <div className="divide-y divide-border text-foreground">
          <div className="py-2.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Phone className="size-3.5" />
              <span>{t("contactPhone")}</span>
            </span>
            <PhoneCell phone={customer.contactPhone} showCopy={true} />
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Mail className="size-3.5" />
              <span>{t("emailAddress")}</span>
            </span>
            <span className="font-medium text-foreground">{displayEmail}</span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Sparkles className="size-3.5" />
              <span>{t("acquisitionChannel")}</span>
            </span>
            <span className="font-medium text-primary px-2 py-0.5 rounded-full bg-primary/10 text-2xs">
              {sourceConfig.label}
            </span>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="size-3.5" />
              <span>{t("registrationDate")}</span>
            </span>
            <span className="font-mono text-foreground">{formatDateTime(customer.createdAt)}</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* KPI Stats summary */}
      <div className="flex flex-col sm:flex-row sm:items-center py-1">
        <div className="flex-1 space-y-1 p-2">
          <div className="flex items-center gap-1.5 text-2xs text-muted-foreground font-semibold">
            <ShoppingBag className="size-3.5 text-primary" />
            <span>{t("kpiTotalOrders")}</span>
          </div>
          <div className="text-lg font-bold font-mono text-foreground">{customer.ordersCount}</div>
          <div className="text-2xs text-muted-foreground">
            {customer.hasActiveOrders ? t("activeOrdersPresent") : t("noActiveOrders")}
          </div>
        </div>

        <Separator orientation="vertical" className="hidden sm:block h-10 mx-3 shrink-0" />
        <Separator orientation="horizontal" className="sm:hidden my-2" />

        <div className="flex-1 space-y-1 p-2">
          <div className="flex items-center gap-1.5 text-2xs text-muted-foreground font-semibold">
            <DollarSign className="size-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{t("kpiTotalSpent")}</span>
          </div>
          <div className="text-lg font-bold font-mono text-foreground">
            {formatAmount(customer.totalSpentCDF, "CDF")}
          </div>
          <div className="text-2xs text-muted-foreground">
            {customer.lastOrderAt ? t("lastOrderRelative", { time: formatRelativeTime(customer.lastOrderAt) }) : t("neverOrdered")}
          </div>
        </div>
      </div>
    </div>
  );
}
