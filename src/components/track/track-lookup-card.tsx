"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Search, ArrowRight, Package, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OrderListItemRecord } from "@/dal";

interface TrackLookupCardProps {
  recentOrders?: OrderListItemRecord[];
}

export function TrackLookupCard({ recentOrders = [] }: TrackLookupCardProps) {
  const t = useTranslations("track");
  const router = useRouter();
  const [tokenInput, setTokenInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = tokenInput.trim();
    if (!trimmed) {
      setError(t("emptyStateSubtitle"));
      return;
    }

    // Extract token if user pasted full URL like https://.../track/token
    let token = trimmed;
    if (trimmed.includes("/track/")) {
      const parts = trimmed.split("/track/");
      token = parts[parts.length - 1].split("?")[0].split("#")[0];
    }

    if (!token) {
      setError(t("emptyStateSubtitle"));
      return;
    }

    setError(null);
    router.push(`/track/${encodeURIComponent(token)}`);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100dvh-16rem)] py-8 sm:py-12 px-4 w-full">
      <div className="w-full max-w-lg mx-auto flex flex-col items-center">
        {/* Main centered card */}
        <div className="w-full p-8 sm:p-10 bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col items-center text-center">
          <div className="size-16 sm:size-20 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mb-5 shadow-2xs">
            <Search className="size-8 sm:size-10" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {t("searchTitle")}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 mb-6 max-w-sm leading-relaxed">
            {t("searchSubtitle")}
          </p>

          <form onSubmit={handleSubmit} className="w-full space-y-3">
            <div className="relative">
              <label htmlFor="track-token-input" className="sr-only">
                {t("inputPlaceholder")}
              </label>
              <input
                id="track-token-input"
                type="text"
                value={tokenInput}
                onChange={(e) => {
                  setTokenInput(e.target.value);
                  if (error) setError(null);
                }}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "track-token-error" : undefined}
                placeholder={t("inputPlaceholder")}
                className="w-full px-4 py-3.5 rounded-2xl border border-slate-300 bg-slate-50/50 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
            </div>

            {error && (
              <p id="track-token-error" className="text-xs text-rose-600 font-medium text-left px-1">
                {error}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full font-bold gap-2 py-3.5 rounded-xl shadow-sm cursor-pointer"
            >
              <span>{t("searchButton")}</span>
              <ArrowRight className="size-4" />
            </Button>
          </form>
        </div>

        {/* If user is logged in and has active/recent orders, display quick access */}
        {recentOrders.length > 0 && (
          <div className="w-full mt-6 p-5 sm:p-6 bg-white rounded-3xl border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Package className="size-3.5 text-primary" />
                <span>{t("myActiveOrders")}</span>
              </span>
              <Link
                href="/orders"
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <span>{t("viewOrder")}</span>
                <ArrowUpRight className="size-3" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {recentOrders.slice(0, 3).map((ord) => (
                <div
                  key={ord.id}
                  className="py-2.5 flex items-center justify-between gap-3 text-left"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {ord.code} • {ord.houseName}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {ord.totalDue.toLocaleString("fr-FR")} {ord.currency}
                    </p>
                  </div>
                  <Button asChild variant="outline" size="sm" className="rounded-lg text-xs font-semibold h-8 shrink-0">
                    <Link href={ord.trackingToken ? `/track/${ord.trackingToken}` : `/orders/${ord.id}`}>
                      {t("viewOrder")}
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
