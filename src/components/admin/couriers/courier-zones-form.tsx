"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { updateCourierZonesAction } from "@/actions/admin-courier.actions";
import { Button } from "@/components/ui/button";
import type { CourierZoneRecord, ZoneRecord } from "@/dal";

interface CourierZonesFormProps {
  courierId: string;
  coveredZones: CourierZoneRecord[];
  allZones: ZoneRecord[];
}

export function CourierZonesForm({
  courierId,
  coveredZones,
  allZones,
}: CourierZonesFormProps) {
  const t = useTranslations("admin.couriers");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(coveredZones.map((z) => z.zoneId))
  );
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  function toggleZone(zoneId: string) {
    const next = new Set(selectedIds);
    if (next.has(zoneId)) {
      next.delete(zoneId);
    } else {
      next.add(zoneId);
    }
    setSelectedIds(next);
  }

  async function handleSave() {
    setLoading(true);
    setMsg(null);
    const res = await updateCourierZonesAction(courierId, Array.from(selectedIds));
    setLoading(false);
    if (!res.ok) {
      setMsg(res.error);
    } else {
      setMsg("Zones couvertes mises à jour");
    }
  }

  return (
    <div className="p-5 bg-white rounded-xl border border-border shadow-xs space-y-4">
      <div>
        <div className="font-bold text-sm text-heading">{t("coveredZones")}</div>
        <p className="text-xs text-muted-foreground mt-0.5">
          Un coursier ne peut recevoir une mission que s&apos;il couvre à la fois la zone du client et celle du pressing (AC 20).
        </p>
      </div>

      {msg && <div className="text-xs text-primary font-semibold">{msg}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {allZones.map((z) => {
          const isChecked = selectedIds.has(z.id);
          return (
            <label
              key={z.id}
              className={`p-3 rounded-lg border text-xs font-semibold cursor-pointer flex items-center justify-between transition ${
                isChecked
                  ? "bg-primary/5 border-primary text-primary"
                  : "bg-slate-50 border-border text-heading"
              }`}
            >
              <span>{z.name}</span>
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => toggleZone(z.id)}
                className="rounded"
              />
            </label>
          );
        })}
      </div>

      <div className="flex justify-end pt-2">
        <Button onClick={handleSave} disabled={loading} size="sm" className="h-9">
          {loading ? "..." : "Enregistrer les zones"}
        </Button>
      </div>
    </div>
  );
}
