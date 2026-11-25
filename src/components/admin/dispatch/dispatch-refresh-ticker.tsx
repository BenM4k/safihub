"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { RefreshCw } from "lucide-react";

interface DispatchRefreshTickerProps {
  intervalSeconds?: number;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export function DispatchRefreshTicker({
  intervalSeconds = 45,
  isRefreshing,
  onRefresh,
}: DispatchRefreshTickerProps) {
  const t = useTranslations("admin.dispatch");
  const [secondsLeft, setSecondsLeft] = useState(intervalSeconds);
  const secondsRef = useRef(intervalSeconds);

  useEffect(() => {
    secondsRef.current = intervalSeconds;
    const id = setInterval(() => {
      if (secondsRef.current <= 1) {
        secondsRef.current = intervalSeconds;
        setSecondsLeft(intervalSeconds);
        onRefresh();
      } else {
        secondsRef.current -= 1;
        setSecondsLeft(secondsRef.current);
      }
    }, 1000);

    return () => clearInterval(id);
  }, [intervalSeconds, onRefresh]);

  function handleManualClick() {
    secondsRef.current = intervalSeconds;
    setSecondsLeft(intervalSeconds);
    onRefresh();
  }

  return (
    <div className="flex items-center gap-3 self-start sm:self-center">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-full border border-border tabular-nums">
        <RefreshCw
          className={`size-3.5 ${
            isRefreshing ? "animate-spin text-primary" : "text-muted-foreground"
          }`}
        />
        <span>
          {isRefreshing
            ? t("autoRefreshing")
            : t("autoRefreshIn", { seconds: secondsLeft })}
        </span>
      </div>

      <button
        type="button"
        onClick={handleManualClick}
        disabled={isRefreshing}
        className="min-h-10 px-2 text-xs font-semibold text-primary hover:underline press cursor-pointer disabled:opacity-50"
      >
        {t("refreshNow")}
      </button>
    </div>
  );
}
