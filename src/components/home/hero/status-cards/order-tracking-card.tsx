"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  Check,
  Clock,
  Lock,
  MapPin,
  ShieldCheck,
  Camera,
} from "lucide-react";
import { BrandLogoMark } from "@/components/common/brand-logo";
import { GarmentIcon } from "@/components/common/garment-icon";

export function OrderTrackingCard() {
  const t = useTranslations("hero.statusCard");

  const steps = [
    { key: "collected", label: t("stepCollected"), state: "done" as const },
    { key: "counted", label: t("stepCounted"), state: "done" as const },
    { key: "washing", label: t("stepWashing"), state: "active" as const },
    { key: "delivery", label: t("stepDelivery"), state: "upcoming" as const },
  ];

  const orderItems = [
    { kind: "shirt" as const, name: t("item1Name"), meta: t("item1Meta"), price: "7 500 CDF" },
    { kind: "suit" as const, name: t("item2Name"), meta: t("item2Meta"), price: "15 000 CDF" },
    { kind: "trousers" as const, name: t("item3Name"), meta: t("item3Meta"), price: "6 000 CDF" },
    { kind: "bedding" as const, name: "Parure de lit 2 places", meta: "1× · Standard", price: "9 000 CDF" },
  ];

  return (
    <div className="w-full bg-background text-foreground flex flex-col">
      {/* Actual App Top Navbar */}
      <div className="px-4 py-2.5 bg-card border-b border-border flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BrandLogoMark size="sm" />
          <span className="font-display font-bold text-sm text-heading">
            Safi<span className="text-primary">Hub</span>
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-[11px] font-medium text-muted-foreground">
          <span>Pressings</span>
          <span>Panier</span>
          <span className="text-primary font-semibold">Commandes</span>
          <span>Compte</span>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-success-soft text-success inline-flex items-center gap-1">
          <span className="size-1.5 rounded-full bg-success animate-pulse" />
          {t("liveStatus")}
        </span>
      </div>

      {/* Actual /orders/[orderId] Page Body */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/70">
          <div>
            <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
              <ArrowLeft className="size-3" aria-hidden="true" />
              /orders/SH-2849
            </span>
            <h3 className="text-base sm:text-lg font-bold text-heading tracking-tight mt-0.5">
              {t("orderLabel")} #SH-2849
            </h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="size-3.5 text-primary shrink-0" aria-hidden="true" />
              <span className="truncate">{t("route")}</span>
            </p>
          </div>
          <span className="eyebrow self-start sm:self-auto">{t("etaWindow")}</span>
        </div>

        {/* 2-Column Real Page Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
          {/* Left 7 cols: Stepper + Itemized Garment Card */}
          <div className="md:col-span-7 space-y-3.5">
            {/* Order Timeline Card */}
            <div className="rounded-xl bg-card border border-border p-3.5 shadow-soft">
              <div className="grid grid-cols-4 gap-1 relative">
                {steps.map((step, idx) => (
                  <div key={step.key} className="flex flex-col items-center text-center gap-1.5 relative">
                    {idx < steps.length - 1 && (
                      <div
                        aria-hidden="true"
                        className={`hidden sm:block absolute top-3 left-[calc(50%+14px)] right-[calc(-50%+14px)] h-0.5 ${
                          step.state === "done" ? "bg-success" : "bg-border"
                        }`}
                      />
                    )}
                    <span
                      className={`relative z-10 size-6 rounded-full flex items-center justify-center text-[10px] font-semibold ${
                        step.state === "done"
                          ? "bg-success text-white"
                          : step.state === "active"
                            ? "bg-primary text-primary-foreground ring-4 ring-primary-soft"
                            : "bg-muted text-muted-foreground border border-border"
                      }`}
                    >
                      {step.state === "done" ? <Check className="size-3.5 stroke-[2.5]" aria-hidden="true" /> : idx + 1}
                    </span>
                    <span className={`text-[10px] leading-tight ${step.state === "active" ? "font-semibold text-primary" : step.state === "done" ? "font-medium text-heading" : "text-muted-foreground"}`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Items Card */}
            <div className="rounded-xl bg-card border border-border shadow-soft overflow-hidden">
              <div className="divide-y divide-border/60 px-3.5">
                {orderItems.map((item) => (
                  <div key={item.kind} className="py-2.5 flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <GarmentIcon kind={item.kind} size="sm" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-heading truncate">{item.name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{item.meta}</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-heading tabular-nums shrink-0">{item.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right 5 cols: Summary + Courier + PIN */}
          <div className="md:col-span-5 space-y-3">
            <div className="rounded-xl bg-card border border-border p-3.5 shadow-soft space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{t("totalLabel")}</span>
              </div>
              <div className="flex items-baseline justify-between border-b border-border/60 pb-2.5">
                <span className="text-base font-bold text-heading tabular-nums">37 500 CDF</span>
                <span className="text-[11px] text-muted-foreground tabular-nums">≈ $13.15</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-primary font-medium">
                <Lock className="size-3.5 shrink-0" aria-hidden="true" />
                <span>{t("etaSecurity")}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-success font-medium">
                <Camera className="size-3.5 shrink-0" aria-hidden="true" />
                <span>{t("courierMeta")}</span>
              </div>
            </div>

            <div className="rounded-xl bg-surface border border-border p-3 flex items-center gap-2.5">
              <div className="relative size-9 rounded-full overflow-hidden border border-border shrink-0 bg-muted">
                <Image
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80"
                  alt={t("courierTitle")}
                  fill
                  priority
                  sizes="36px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-heading flex items-center gap-1 truncate">
                  <span className="truncate">{t("courierTitle")}</span>
                  <ShieldCheck className="size-3.5 text-success shrink-0" aria-hidden="true" />
                </p>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Clock className="size-3 text-primary shrink-0" aria-hidden="true" />
                  <span className="truncate">{t("etaWindow")}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
