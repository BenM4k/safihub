"use client";

import { Calendar, DollarSign, Mail, Phone, ShoppingBag, Sparkles } from "lucide-react";
import { PhoneCell } from "@/components/admin/shared/phone-cell";
import { StatusPill } from "@/components/admin/shared/status-pill";
import { formatCustomerEmail, formatCustomerName, isTestCustomer } from "@/lib/customer-formatters";
import { formatAmount, formatDateTime, formatRelativeTime, getSourceConfig } from "@/lib/order-formatters";
import type { CustomerDetailedProfile } from "@/services/admin";

interface CustomerTabProfileProps {
  profile: CustomerDetailedProfile;
}

export function CustomerTabProfile({ profile }: CustomerTabProfileProps) {
  const { customer } = profile;
  const isGuest = customer.isGuest;
  const isBlocked = customer.banned || customer.status === "blocked";
  const isTest = isTestCustomer(customer);
  const displayName = formatCustomerName(customer.name, customer.contactPhone);
  const displayEmail = formatCustomerEmail(customer.email);
  const sourceConfig = getSourceConfig(customer.firstOrderSource || (isGuest ? "phone" : "app"));

  return (
    <div className="space-y-4 text-xs">
      {/* Identity card */}
      <div className="p-4 rounded-xl border-2 border-border-strong bg-card space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="font-bold text-sm text-heading font-display">{displayName}</div>
          <div className="flex items-center gap-1.5">
            {isGuest ? (
              <span className="px-2 py-0.5 rounded-md text-2xs font-bold bg-amber-50 text-amber-700 border border-amber-300">
                Invité
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-md text-2xs font-bold bg-primary-soft text-primary border border-primary/20">
                Inscrit
              </span>
            )}
            {isBlocked ? (
              <StatusPill status="blocked" customLabel="Bloqué" title={customer.banReason || undefined} />
            ) : (
              <StatusPill status="active" customLabel="Actif" />
            )}
          </div>
        </div>

        {isTest && (
          <div className="p-2 rounded-lg bg-slate-100 border border-slate-300 text-2xs text-slate-700 font-semibold flex items-center gap-1.5">
            <Sparkles className="size-3 text-amber-600" />
            <span>Compte détecté comme compte de test / bac à sable</span>
          </div>
        )}

        <div className="divide-y divide-border-strong/70 text-ink-700">
          <div className="py-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-ink-500">
              <Phone className="size-3.5" />
              <span>Téléphone de contact</span>
            </span>
            <PhoneCell phone={customer.contactPhone} showCopy={true} />
          </div>

          <div className="py-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-ink-500">
              <Mail className="size-3.5" />
              <span>Adresse e-mail</span>
            </span>
            <span className="font-medium text-heading">{displayEmail}</span>
          </div>

          <div className="py-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-ink-500">
              <Sparkles className="size-3.5" />
              <span>Canal d&apos;acquisition</span>
            </span>
            <span className="font-semibold text-primary px-2 py-0.5 rounded-md bg-primary-soft border border-primary/20 text-2xs">
              {sourceConfig.label}
            </span>
          </div>

          <div className="py-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-ink-500">
              <Calendar className="size-3.5" />
              <span>Date d&apos;inscription</span>
            </span>
            <span className="font-mono text-heading">{formatDateTime(customer.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* KPI Stats summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3.5 rounded-xl border-2 border-border-strong bg-slate-50 space-y-1">
          <div className="flex items-center gap-1.5 text-2xs text-ink-500 font-semibold">
            <ShoppingBag className="size-3.5 text-primary" />
            <span>Total commandes</span>
          </div>
          <div className="text-lg font-black font-mono text-heading">{customer.ordersCount}</div>
          <div className="text-2xs text-ink-500">
            {customer.hasActiveOrders ? "Commandes en cours" : "Aucune commande active"}
          </div>
        </div>

        <div className="p-3.5 rounded-xl border-2 border-border-strong bg-slate-50 space-y-1">
          <div className="flex items-center gap-1.5 text-2xs text-ink-500 font-semibold">
            <DollarSign className="size-3.5 text-emerald-600" />
            <span>Total dépensé</span>
          </div>
          <div className="text-lg font-black font-mono text-heading">
            {formatAmount(customer.totalSpentCDF, "CDF")}
          </div>
          <div className="text-2xs text-ink-500">
            {customer.lastOrderAt ? `Dernière: ${formatRelativeTime(customer.lastOrderAt)}` : "Jamais commandé"}
          </div>
        </div>
      </div>
    </div>
  );
}
