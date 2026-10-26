"use client";

import { Crop } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";

interface BannerCropEditorProps {
  previewUrl: string;
  focalPoint: { x: number; y: number };
  onFocalPointChange: (point: { x: number; y: number }) => void;
  onChooseAnother: () => void;
}

export function BannerCropEditor({
  previewUrl,
  focalPoint,
  onFocalPointChange,
  onChooseAnother,
}: BannerCropEditorProps) {
  const t = useTranslations("house.bannerModal");

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/1] w-full rounded-xl overflow-hidden border border-border bg-secondary">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={previewUrl}
          alt="Ratio 4:1 preview"
          className="w-full h-full object-cover"
          style={{ objectPosition: `${focalPoint.x}% ${focalPoint.y}%` }}
        />
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="text-[10px] font-bold">
            {t("ratioBadge")}
          </Badge>
        </div>
      </div>

      <div className="p-3 bg-muted/20 rounded-xl border border-border/60 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-foreground flex items-center gap-1.5">
            <Crop className="size-3.5 text-primary" />
            {t("focalPoint")}
          </span>
          <span className="text-[11px] font-mono text-muted-foreground">
            {focalPoint.y}%
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={focalPoint.y}
          onChange={(e) =>
            onFocalPointChange({ x: 50, y: Number(e.target.value) })
          }
          className="w-full accent-primary cursor-pointer"
        />
      </div>

      <button
        type="button"
        onClick={onChooseAnother}
        className="text-xs text-primary hover:underline font-semibold inline-block cursor-pointer"
      >
        {t("chooseAnother")}
      </button>
    </div>
  );
}
