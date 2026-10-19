"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { useTranslations } from "next-intl";

interface PressingShareButtonProps {
  name: string;
}

export function PressingShareButton({ name }: PressingShareButtonProps) {
  const t = useTranslations("customerHouses");
  const [isCopied, setIsCopied] = useState(false);

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const title = `${name} | SafiHub Bukavu`;
    const text = t("shareText", { name });

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (err) {
        // Fallback to clipboard if cancelled or not supported
        if ((err as Error)?.name === "AbortError") return;
      }
    }

    // WhatsApp fallback / clipboard
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
      } catch {
        // Open WhatsApp link fallback
        window.open(
          `https://wa.me/?text=${encodeURIComponent(`${text} : ${url}`)}`,
          "_blank"
        );
      }
    }
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={handleShare}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-2xs active:scale-95"
        title={t("shareHouse")}
      >
        {isCopied ? (
          <>
            <Check className="size-3.5 text-emerald-600" />
            <span className="text-emerald-700">{t("shareSuccess")}</span>
          </>
        ) : (
          <>
            <Share2 className="size-3.5 text-slate-500" />
            <span>{t("shareHouse")}</span>
          </>
        )}
      </button>
    </div>
  );
}
