"use client";

import { useState } from "react";
import Link from "next/link";
import { createManualOrderAction } from "@/actions/admin-order.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, CheckCircle2 } from "lucide-react";
import type {
  HouseRecord,
  MasterFabricRecord,
  MasterItemRecord,
  MasterServiceRecord,
  NeighborhoodRecord,
} from "@/dal";

interface ManualOrderFormProps {
  houses: HouseRecord[];
  neighborhoods: NeighborhoodRecord[];
  services: MasterServiceRecord[];
  items: MasterItemRecord[];
  fabrics: MasterFabricRecord[];
}

interface ItemLine {
  serviceId: string;
  itemId: string;
  fabricId: string;
  quantity: number;
}

export function ManualOrderForm({
  houses,
  neighborhoods,
  services,
  items,
  fabrics,
}: ManualOrderFormProps) {
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

  function addLine() {
    setLines([
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
      setLines(lines.filter((_, i) => i !== idx));
    }
  }

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
          setError("Date de début de créneau invalide");
          return;
        }
        isoStart = startDate.toISOString();
      }

      if (slotEnd) {
        const endDate = new Date(slotEnd);
        if (isNaN(endDate.getTime())) {
          setError("Date de fin de créneau invalide");
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
      setError(err instanceof Error ? err.message : "Erreur inattendue lors de la création");
    } finally {
      setLoading(false);
    }
  }

  if (createdOrder) {
    return (
      <div className="p-8 bg-white rounded-xl border border-border shadow-xs text-center space-y-4 max-w-lg mx-auto">
        <div className="size-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
          <CheckCircle2 className="size-6" />
        </div>
        <h2 className="text-xl font-bold text-heading">
          Commande créée avec succès !
        </h2>
        <div className="p-4 bg-slate-50 rounded-lg text-xs space-y-2 font-mono">
          <div>Code : <span className="font-bold text-primary">{createdOrder.code}</span></div>
          <div>Jeton : {createdOrder.trackingToken}</div>
        </div>
        <div className="flex justify-center gap-3 pt-2">
          <Link
            href={`/track/${createdOrder.trackingToken}`}
            target="_blank"
            className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-hover"
          >
            Lien de suivi client →
          </Link>
          <Button variant="outline" size="sm" onClick={() => setCreatedOrder(null)}>
            Nouvelle saisie
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-xl border border-border shadow-xs space-y-6 max-w-3xl">
      {error && <div className="p-3 bg-red-50 text-xs text-destructive rounded-lg border border-red-200">{error}</div>}

      <div className="space-y-4">
        <h2 className="text-sm font-bold text-heading">1. Canal et Contact Client</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Canal</Label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value as "whatsapp" | "phone")}
              className="h-9 w-full rounded border border-input bg-white px-2 text-xs"
            >
              <option value="whatsapp">WhatsApp</option>
              <option value="phone">Appel Téléphonique</option>
            </select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Numéro de téléphone (requis)</Label>
            <Input required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+243..." className="h-9 text-xs" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Nom du client</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nom (ou laisser vide)" className="h-9 text-xs" />
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-2 border-t border-border">
        <h2 className="text-sm font-bold text-heading">2. Localisation & Pressing</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Quartier client</Label>
            <select
              value={neighborhoodId}
              onChange={(e) => setNeighborhoodId(e.target.value)}
              className="h-9 w-full rounded border border-input bg-white px-2 text-xs"
            >
              {neighborhoods.map((n) => (
                <option key={n.id} value={n.id}>{n.name} ({n.zoneName})</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Repère précis</Label>
            <Input required value={landmark} onChange={(e) => setLandmark(e.target.value)} placeholder="Av. Maniema, n° 12..." className="h-9 text-xs" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Pressing partenaire</Label>
            <select
              value={houseId}
              onChange={(e) => setHouseId(e.target.value)}
              className="h-9 w-full rounded border border-input bg-white px-2 text-xs"
            >
              {houses.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Début créneau (optionnel)</Label>
            <Input
              type="datetime-local"
              value={slotStart}
              onChange={(e) => setSlotStart(e.target.value)}
              className="h-9 text-xs font-mono"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Fin créneau (optionnel)</Label>
            <Input
              type="datetime-local"
              value={slotEnd}
              onChange={(e) => setSlotEnd(e.target.value)}
              className="h-9 text-xs font-mono"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-2 border-t border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-heading">3. Articles du panier</h2>
          <Button type="button" variant="outline" size="sm" onClick={addLine} className="h-8 text-xs gap-1">
            <Plus className="size-3.5" />
            <span>Ajouter ligne</span>
          </Button>
        </div>

        <div className="space-y-2">
          {lines.map((line, idx) => (
            <div key={idx} className="flex flex-wrap items-center gap-2 p-2.5 rounded bg-slate-50 border border-border">
              <select
                value={line.serviceId}
                onChange={(e) => {
                  const copy = [...lines];
                  copy[idx]!.serviceId = e.target.value;
                  setLines(copy);
                }}
                className="h-8 rounded border border-input bg-white px-2 text-xs flex-1 min-w-[120px]"
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>{s.nameFr}</option>
                ))}
              </select>

              <select
                value={line.itemId}
                onChange={(e) => {
                  const copy = [...lines];
                  copy[idx]!.itemId = e.target.value;
                  setLines(copy);
                }}
                className="h-8 rounded border border-input bg-white px-2 text-xs flex-1 min-w-[140px]"
              >
                {items.map((it) => (
                  <option key={it.id} value={it.id}>{it.nameFr}</option>
                ))}
              </select>

              <select
                value={line.fabricId}
                onChange={(e) => {
                  const copy = [...lines];
                  copy[idx]!.fabricId = e.target.value;
                  setLines(copy);
                }}
                className="h-8 rounded border border-input bg-white px-2 text-xs flex-1 min-w-[100px]"
              >
                {fabrics.map((f) => (
                  <option key={f.id} value={f.id}>{f.nameFr}</option>
                ))}
              </select>

              <Input
                type="number"
                min="1"
                value={line.quantity}
                onChange={(e) => {
                  const copy = [...lines];
                  copy[idx]!.quantity = Number(e.target.value) || 1;
                  setLines(copy);
                }}
                className="h-8 w-16 text-xs bg-white text-center"
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

      <div className="flex justify-end pt-4 border-t border-border">
        <Button type="submit" disabled={loading} size="lg">
          {loading ? "Validation du panier..." : "Valider et créer la commande"}
        </Button>
      </div>
    </form>
  );
}
