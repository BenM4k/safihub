"use client";

import { Home, MapPin } from "lucide-react";
import { PhoneCell } from "@/components/admin/shared/phone-cell";
import type { CustomerDetailedProfile } from "@/services/admin";

interface CustomerTabAddressesProps {
  profile: CustomerDetailedProfile;
}

export function CustomerTabAddresses({ profile }: CustomerTabAddressesProps) {
  const { addresses } = profile;

  if (addresses.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-ink-500 border-2 border-border-strong rounded-xl bg-card">
        <MapPin className="size-8 text-ink-400 mx-auto mb-2" />
        <div className="font-semibold text-heading">Aucune adresse enregistrée</div>
        <div className="text-2xs text-ink-500 mt-0.5">Le client renseigne son adresse lors de la commande.</div>
      </div>
    );
  }

  return (
    <div className="space-y-3 text-xs">
      <div className="flex items-center justify-between text-2xs text-ink-500 font-semibold px-1">
        <span>{addresses.length} adresse(s) enregistrée(s)</span>
      </div>

      <div className="divide-y divide-border-strong border-2 border-border-strong rounded-xl bg-card overflow-hidden">
        {addresses.map((addr) => (
          <div key={addr.id} className="p-3.5 hover:bg-surface transition-colors space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-heading">
                <Home className="size-3.5 text-primary" />
                <span>{addr.label || "Adresse de livraison"}</span>
              </div>
              {addr.isDefault && (
                <span className="px-2 py-0.5 rounded-md text-2xs font-bold bg-primary-soft text-primary border border-primary/20">
                  Par défaut
                </span>
              )}
            </div>

            <div className="text-2xs text-ink-700">
              <span className="font-semibold text-heading">{addr.neighborhoodName || "Quartier"}</span> · {addr.landmark}
            </div>

            <div className="text-2xs text-ink-500 flex items-center gap-1.5 pt-1">
              <span>Contact livraison :</span>
              <PhoneCell phone={addr.phone} showCopy={true} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
