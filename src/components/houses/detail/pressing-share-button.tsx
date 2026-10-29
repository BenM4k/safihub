"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
        if ((err as Error)?.name === "AbortError") return;
      }
    }

    // Clipboard fallback
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        setIsCopied(true);
        toast.success(t("shareSuccess"));
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
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="outline"
          onClick={handleShare}
          className="h-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/70 bg-card hover:bg-muted text-foreground text-xs font-bold transition shadow-2xs active:scale-95 cursor-pointer"
        >
          {isCopied ? (
            <>
              <Check className="size-3.5 text-success" />
              <span className="text-success">{t("shareSuccess")}</span>
            </>
          ) : (
            <>
              <Share2 className="size-3.5 text-muted-foreground" />
              <span>{t("shareHouse")}</span>
            </>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{t("shareHouse")}</p>
      </TooltipContent>
    </Tooltip>
  );
}
