"use client";

import { useEffect, useState } from "react";
import { Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export function AcceptanceTimer({
  deadline,
  className,
}: {
  deadline: Date | string | null;
  className?: string;
}) {
  const [timeLeft, setTimeLeft] = useState<{
    minutes: number;
    seconds: number;
    isExpired: boolean;
  } | null>(null);

  useEffect(() => {
    if (!deadline) return;

    const targetTime = new Date(deadline).getTime();

    function calculate() {
      const now = Date.now();
      const diffMs = targetTime - now;

      if (diffMs <= 0) {
        setTimeLeft({ minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const totalSec = Math.floor(diffMs / 1000);
      const minutes = Math.floor(totalSec / 60);
      const seconds = totalSec % 60;
      setTimeLeft({ minutes, seconds, isExpired: false });
    }

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  if (!deadline) {
    return <span className="text-xs text-slate-400">Pas de délai</span>;
  }

  if (!timeLeft) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-slate-500">
        <Clock className="size-3.5" />
        Calcul...
      </span>
    );
  }

  if (timeLeft.isExpired) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200",
          className
        )}
      >
        <AlertTriangle className="size-3 shrink-0" />
        <span>Expiré</span>
      </span>
    );
  }

  const isUrgent = timeLeft.minutes < 15;
  const isWarning = timeLeft.minutes < 25;

  const formatted = `${timeLeft.minutes}m ${timeLeft.seconds < 10 ? "0" : ""}${timeLeft.seconds}s`;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all",
        isUrgent
          ? "bg-rose-50 text-rose-700 border border-rose-300 animate-pulse"
          : isWarning
          ? "bg-amber-50 text-amber-700 border border-amber-300"
          : "bg-emerald-50 text-emerald-700 border border-emerald-300",
        className
      )}
    >
      <Clock className="size-3 shrink-0" />
      <span>{formatted}</span>
    </span>
  );
}
