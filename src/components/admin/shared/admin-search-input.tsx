"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface AdminSearchInputProps {
  value?: string;
  onSearch?: (query: string) => void;
  onClear?: () => void;
  urlMode?: boolean;
  paramName?: string;
  resetPageParam?: string;
  placeholder?: string;
  ariaLabel?: string;
  isLoading?: boolean;
  className?: string;
}

export function AdminSearchInput({
  value = "",
  onSearch,
  onClear,
  urlMode = false,
  paramName = "search",
  resetPageParam = "page",
  placeholder,
  ariaLabel,
  isLoading = false,
  className,
}: AdminSearchInputProps) {
  const t = useTranslations("admin.shared");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const activeQuery = urlMode ? (searchParams.get(paramName) ?? "") : value;
  const [draft, setDraft] = useState(activeQuery);
  const [trackedActive, setTrackedActive] = useState(activeQuery);

  if (trackedActive !== activeQuery) {
    setTrackedActive(activeQuery);
    setDraft(activeQuery);
  }

  const resolvedPlaceholder = placeholder ?? t("searchPlaceholder");
  const resolvedAriaLabel = ariaLabel ?? resolvedPlaceholder;
  const busy = isLoading || isPending;
  const hasValue = draft.length > 0 || activeQuery.length > 0;

  function applyQuery(nextQuery: string) {
    const trimmed = nextQuery.trim();
    if (urlMode) {
      const nextParams = new URLSearchParams(searchParams.toString());
      if (trimmed) {
        nextParams.set(paramName, trimmed);
      } else {
        nextParams.delete(paramName);
      }
      if (resetPageParam) {
        nextParams.delete(resetPageParam);
      }
      const qs = nextParams.toString();
      const targetUrl = qs ? `${pathname}?${qs}` : pathname;
      startTransition(() => {
        router.push(targetUrl);
      });
    }
    onSearch?.(trimmed);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    applyQuery(draft);
  }

  function handleClear() {
    setDraft("");
    if (urlMode) {
      const nextParams = new URLSearchParams(searchParams.toString());
      nextParams.delete(paramName);
      if (resetPageParam) {
        nextParams.delete(resetPageParam);
      }
      const qs = nextParams.toString();
      const targetUrl = qs ? `${pathname}?${qs}` : pathname;
      startTransition(() => {
        router.push(targetUrl);
      });
    }
    if (onClear) {
      onClear();
    } else {
      onSearch?.("");
    }
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className={cn("flex items-center gap-2 w-full", className)}
    >
      <div className="relative flex-1 min-w-0">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={resolvedPlaceholder}
          aria-label={resolvedAriaLabel}
          disabled={busy}
          className="pl-9 pr-11 text-base sm:text-sm min-h-11 bg-background border-border"
        />
        {hasValue && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClear}
            disabled={busy}
            aria-label={t("clearSearch")}
            title={t("clearSearch")}
            className="absolute right-0.5 top-1/2 -translate-y-1/2 size-10 min-h-10 min-w-10 rounded-md text-muted-foreground hover:text-heading"
          >
            <X className="size-4" aria-hidden="true" />
          </Button>
        )}
      </div>

      <Button
        type="submit"
        variant="secondary"
        disabled={busy}
        className="min-h-11 px-4 text-xs sm:text-sm font-semibold shrink-0 gap-1.5"
      >
        {busy ? (
          <Spinner className="size-4" aria-hidden="true" />
        ) : (
          <Search className="size-4" aria-hidden="true" />
        )}
        <span>{t("searchButton")}</span>
      </Button>
    </form>
  );
}
