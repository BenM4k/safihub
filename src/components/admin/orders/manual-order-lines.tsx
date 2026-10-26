"use client";

import { Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  MasterFabricRecord,
  MasterItemRecord,
  MasterServiceRecord,
} from "@/dal";

export interface ItemLine {
  serviceId: string;
  itemId: string;
  fabricId: string;
  quantity: number;
}

interface ManualOrderLinesProps {
  lines: ItemLine[];
  onLinesChange: (lines: ItemLine[]) => void;
  services: MasterServiceRecord[];
  items: MasterItemRecord[];
  fabrics: MasterFabricRecord[];
}

export function ManualOrderLines({
  lines,
  onLinesChange,
  services,
  items,
  fabrics,
}: ManualOrderLinesProps) {
  const t = useTranslations("admin.orders.manualForm");

  function addLine() {
    onLinesChange([
      ...lines,
      {
        serviceId: services[0]?.id || "",
        itemId: items[0]?.id || "",
        fabricId: fabrics[0]?.id || "",
        quantity: 1,
      },
    ]);
  }

  function removeLine(idx: number) {
    if (lines.length > 1) {
      onLinesChange(lines.filter((_, i) => i !== idx));
    }
  }

  function updateLine(idx: number, patch: Partial<ItemLine>) {
    const copy = [...lines];
    copy[idx] = { ...copy[idx]!, ...patch };
    onLinesChange(copy);
  }

  return (
    <div className="space-y-4 pt-2 border-t border-border">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-foreground">{t("cartItems")}</h2>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addLine}
          className="h-8 text-xs gap-1"
        >
          <Plus className="size-3.5" />
          <span>{t("addLine")}</span>
        </Button>
      </div>

      <div className="space-y-2">
        {lines.map((line, idx) => (
          <div
            key={idx}
            className="flex flex-wrap items-center gap-2 p-2.5 rounded-lg bg-muted/20 border border-border"
          >
            <select
              value={line.serviceId}
              onChange={(e) => updateLine(idx, { serviceId: e.target.value })}
              className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground flex-1 min-w-[120px]"
              aria-label={t("service")}
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nameFr}
                </option>
              ))}
            </select>

            <select
              value={line.itemId}
              onChange={(e) => updateLine(idx, { itemId: e.target.value })}
              className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground flex-1 min-w-[140px]"
              aria-label={t("item")}
            >
              {items.map((it) => (
                <option key={it.id} value={it.id}>
                  {it.nameFr}
                </option>
              ))}
            </select>

            <select
              value={line.fabricId}
              onChange={(e) => updateLine(idx, { fabricId: e.target.value })}
              className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground flex-1 min-w-[100px]"
              aria-label={t("fabric")}
            >
              {fabrics.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nameFr}
                </option>
              ))}
            </select>

            <Input
              type="number"
              min="1"
              value={line.quantity}
              onChange={(e) =>
                updateLine(idx, { quantity: Number(e.target.value) || 1 })
              }
              className="h-8 w-16 text-xs text-center font-mono"
              aria-label={t("quantity")}
            />

            {lines.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeLine(idx)}
                className="h-8 size-8 p-0 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
