"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Copy, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPhone } from "@/lib/order-formatters";

interface PhoneCellProps {
  phone: string | null | undefined;
  showIcon?: boolean;
  tapToCall?: boolean;
  showCopy?: boolean;
  className?: string;
}

export function PhoneCell({
  phone,
  showIcon = false,
  tapToCall = true,
  showCopy = false,
  className = "",
}: PhoneCellProps) {
  const t = useTranslations("admin.shared");
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const formatted = formatPhone(phone);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (formatted === "—" || !phone) {
    return <span className="text-muted-foreground">—</span>;
  }

  const rawTelDigits = phone.replace(/[^\d+]/g, "");

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!navigator?.clipboard?.writeText) return;
    try {
      await navigator.clipboard.writeText(phone);
      setCopied(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Ignore clipboard write failures gracefully
    }
  };

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      {tapToCall ? (
        <a
          href={`tel:${rawTelDigits}`}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 text-xs text-ink-700 hover:text-primary hover:underline transition-colors font-medium"
          title={`Appeler le ${formatted}`}
          aria-label={`Appeler le ${formatted}`}
        >
          {showIcon && <Phone className="size-3 text-ink-500 shrink-0" aria-hidden="true" />}
          <span>{formatted}</span>
        </a>
      ) : (
        <span className="inline-flex items-center gap-1.5 text-xs text-ink-700 font-medium">
          {showIcon && <Phone className="size-3 text-ink-500 shrink-0" aria-hidden="true" />}
          <span>{formatted}</span>
        </span>
      )}

      {showCopy && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleCopy}
          className="size-6 p-0 rounded-sm text-ink-400 hover:text-heading hover:bg-surface transition-colors focus-visible:ring-1 focus-visible:ring-primary"
          title={copied ? t("numberCopied") : t("copyNumber")}
          aria-label={copied ? t("numberCopied") : t("copyNumber")}
        >
          {copied ? (
            <Check className="size-3 text-success" aria-hidden="true" />
          ) : (
            <Copy className="size-3" aria-hidden="true" />
          )}
        </Button>
      )}
    </span>
  );
}
