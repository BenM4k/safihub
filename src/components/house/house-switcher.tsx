"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Building2, ChevronDown, Check, ArrowRight } from "lucide-react";
import type { HouseMembershipInfo } from "@/dal";
import { cn } from "@/lib/utils";

interface HouseSwitcherProps {
  houseName: string;
  currentSlug?: string;
  isPaused?: boolean;
  memberships?: HouseMembershipInfo[];
}

export function HouseSwitcher({
  houseName,
  currentSlug,
  isPaused,
  memberships = [],
}: HouseSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("house.header");

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasMultiple = memberships.length > 1;

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={t("selectHouse")}
        className={cn(
          "flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-border bg-surface hover:bg-secondary hover:border-border-strong transition text-xs font-semibold text-foreground shadow-xs max-w-[220px] sm:max-w-[280px]",
          isOpen ? "ring-2 ring-primary/20 border-primary bg-white" : ""
        )}
      >
        <Building2 className="size-3.5 text-primary shrink-0" />
        <span className="truncate">{houseName}</span>
        {isPaused ? (
          <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-warning-soft text-warning shrink-0">
            {t("paused")}
          </span>
        ) : (
          <span className="size-2 rounded-full bg-success shrink-0 animate-pulse" />
        )}
        <ChevronDown
          className={cn(
            "size-3.5 text-muted-foreground shrink-0 transition-transform",
            isOpen ? "rotate-180 text-primary" : ""
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-64 rounded-2xl bg-card border border-border shadow-lift py-2 z-50 animate-in fade-in zoom-in-95">
          <div className="px-3 py-1.5 border-b border-border flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              {t("selectHouse")}
            </span>
            <span className="text-[10px] font-semibold text-muted-foreground">
              {memberships.length} {memberships.length > 1 ? "pressings" : "pressing"}
            </span>
          </div>

          <div className="max-h-56 overflow-y-auto py-1">
            {memberships.map((m) => {
              const isCurrent = m.houseSlug === currentSlug;
              return (
                <Link
                  key={m.houseId}
                  href={`/partner/${m.houseSlug}`}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 text-xs font-medium hover:bg-secondary transition",
                    isCurrent ? "bg-primary-soft text-primary font-bold" : "text-foreground"
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className={cn(
                        "size-1.5 rounded-full shrink-0",
                        m.isPaused ? "bg-warning" : "bg-success"
                      )}
                    />
                    <span className="truncate">{m.houseName}</span>
                  </div>
                  {isCurrent && (
                    <Check className="size-3.5 text-primary shrink-0" />
                  )}
                </Link>
              );
            })}
          </div>

          {hasMultiple && (
            <div className="border-t border-border pt-1.5 px-2">
              <Link
                href="/partner"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-2 py-1.5 rounded-lg text-[11px] font-semibold text-primary hover:bg-primary-soft transition"
              >
                <span>{t("allHouses")}</span>
                <ArrowRight className="size-3" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
