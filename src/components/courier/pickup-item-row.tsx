"use client";

import { useTranslations } from "next-intl";
import { Camera, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PickupItemRowProps {
  name: string;
  fabricName?: string | null;
  declaredQuantity: number;
  pickupQuantity: number;
  isFlagged: boolean;
  hasPhoto: boolean;
  onUpdateQuantity: (delta: number) => void;
  onToggleFlagged: () => void;
  onAttachPhoto: () => void;
}

export function PickupItemRow({
  name,
  fabricName,
  declaredQuantity,
  pickupQuantity,
  isFlagged,
  hasPhoto,
  onUpdateQuantity,
  onToggleFlagged,
  onAttachPhoto,
}: PickupItemRowProps) {
  const t = useTranslations("courier.pickup");

  return (
    <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-3 shadow-2xs">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-bold text-slate-900">{name}</p>
          <p className="text-[11px] text-slate-500">
            {fabricName && `${fabricName} • `}
            {t("declared", { count: declaredQuantity })}
          </p>
        </div>

        {/* Stepper (+ / -) */}
        <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
          <button
            type="button"
            onClick={() => onUpdateQuantity(-1)}
            className="size-7 rounded-lg bg-white text-slate-700 flex items-center justify-center hover:bg-slate-50 shadow-2xs"
          >
            <Minus className="size-3.5" />
          </button>
          <span className="w-6 text-center text-xs font-bold text-slate-900">
            {pickupQuantity}
          </span>
          <button
            type="button"
            onClick={() => onUpdateQuantity(1)}
            className="size-7 rounded-lg bg-white text-slate-700 flex items-center justify-center hover:bg-slate-50 shadow-2xs"
          >
            <Plus className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Flag as valuable or damaged */}
      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isFlagged}
            onChange={onToggleFlagged}
            className="rounded text-purple-600 focus:ring-purple-500"
          />
          <span className="text-[11px] text-slate-700 font-medium">
            {t("flagValuable")}
          </span>
        </label>

        {isFlagged && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onAttachPhoto}
            className={`h-7 px-2 text-[11px] ${
              hasPhoto
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-rose-50 text-rose-700 border-rose-200"
            }`}
          >
            <Camera className="size-3 mr-1" />
            <span>{hasPhoto ? t("photoAttached") : t("addPhoto")}</span>
          </Button>
        )}
      </div>
    </div>
  );
}
