"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createManualOrderAction } from "@/actions/admin-order.actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import type {
  HouseRecord,
  MasterFabricRecord,
  MasterItemRecord,
  MasterServiceRecord,
  NeighborhoodRecord,
} from "@/dal";
import { ManualOrderCustomerFields } from "./manual-order-customer-fields";
import { ManualOrderHouseField } from "./manual-order-house-field";
import { type ItemLine, ManualOrderLines } from "./manual-order-lines";
import { ManualOrderSuccess } from "./manual-order-success";

interface ManualOrderFormProps {
  houses: HouseRecord[];
  neighborhoods: NeighborhoodRecord[];
  services: MasterServiceRecord[];
  items: MasterItemRecord[];
  fabrics: MasterFabricRecord[];
}

export function ManualOrderForm({
  houses,
  neighborhoods,
  services,
  items,
  fabrics,
}: ManualOrderFormProps) {
  const t = useTranslations("admin.orders.manualForm");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [source, setSource] = useState<"whatsapp" | "phone">("whatsapp");
  const [neighborhoodId, setNeighborhoodId] = useState(neighborhoods[0]?.id || "");
  const [landmark, setLandmark] = useState("");
  const [houseId, setHouseId] = useState(houses[0]?.id || "");
  const [slotStart, setSlotStart] = useState("");
  const [slotEnd, setSlotEnd] = useState("");
  const [lines, setLines] = useState<ItemLine[]>([
    {
      serviceId: services[0]?.id || "",
      itemId: items[0]?.id || "",
      fabricId: fabrics[0]?.id || "",
      quantity: 1,
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<{
    code: string;
    trackingToken: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const now = new Date();
      const defaultStart = new Date(now.getTime() + 2 * 3600 * 1000).toISOString();
      const defaultEnd = new Date(now.getTime() + 4 * 3600 * 1000).toISOString();

      let isoStart = defaultStart;
      let isoEnd = defaultEnd;

      if (slotStart) {
        const startDate = new Date(slotStart);
        if (isNaN(startDate.getTime())) {
          setError(t("invalidSlotStart"));
          setLoading(false);
          return;
        }
        isoStart = startDate.toISOString();
      }

      if (slotEnd) {
        const endDate = new Date(slotEnd);
        if (isNaN(endDate.getTime())) {
          setError(t("invalidSlotEnd"));
          setLoading(false);
          return;
        }
        isoEnd = endDate.toISOString();
      }

      const res = await createManualOrderAction({
        customerPhone: phone,
        customerName: name || undefined,
        houseId,
        customerNeighborhoodId: neighborhoodId,
        landmark,
        pickupSlotStart: isoStart,
        pickupSlotEnd: isoEnd,
        source,
        items: lines,
      });

      if (!res.ok) {
        setError(res.error);
      } else {
        setCreatedOrder({
          code: res.value.code,
          trackingToken: res.value.trackingToken,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("unexpectedError"));
    } finally {
      setLoading(false);
    }
  }

  if (createdOrder) {
    return (
      <ManualOrderSuccess
        createdOrder={createdOrder}
        onReset={() => setCreatedOrder(null)}
      />
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 bg-background rounded-lg border border-border space-y-6 max-w-3xl"
    >
      {error && (
        <Alert variant="destructive">
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}

      <ManualOrderCustomerFields
        source={source}
        onSourceChange={setSource}
        phone={phone}
        onPhoneChange={setPhone}
        name={name}
        onNameChange={setName}
      />

      <ManualOrderHouseField
        neighborhoodId={neighborhoodId}
        onNeighborhoodChange={setNeighborhoodId}
        neighborhoods={neighborhoods}
        landmark={landmark}
        onLandmarkChange={setLandmark}
        houseId={houseId}
        onHouseChange={setHouseId}
        houses={houses}
        slotStart={slotStart}
        onSlotStartChange={setSlotStart}
        slotEnd={slotEnd}
        onSlotEndChange={setSlotEnd}
      />

      <ManualOrderLines
        lines={lines}
        onLinesChange={setLines}
        services={services}
        items={items}
        fabrics={fabrics}
      />

      <div className="flex justify-end pt-4 border-t border-border">
        <Button type="submit" disabled={loading} size="lg" className="text-xs font-semibold">
          {loading ? t("submitting") : t("submit")}
        </Button>
      </div>
    </form>
  );
}
