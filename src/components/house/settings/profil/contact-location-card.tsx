"use client";

import { useState } from "react";
import { ExternalLink, MapPin } from "lucide-react";
import { formatPhone } from "@/lib/order-formatters";

interface ContactLocationCardProps {
  contactPhone: string;
  whatsAppPhone: string;
  addressNote: string;
  onChangeContactPhone: (val: string) => void;
  onChangeWhatsAppPhone: (val: string) => void;
  onChangeAddressNote: (val: string) => void;
}

export function ContactLocationCard({
  contactPhone,
  whatsAppPhone,
  addressNote,
  onChangeContactPhone,
  onChangeWhatsAppPhone,
  onChangeAddressNote,
}: ContactLocationCardProps) {
  const [latitude, setLatitude] = useState("-2.5085");
  const [longitude, setLongitude] = useState("28.8617");

  return (
    <section className="bg-card rounded-2xl border border-border p-5 shadow-xs space-y-4">
      <div>
        <h2 className="text-sm font-bold text-heading">Contact & Localisation</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Informations utilisées pour les opérations logistiques et la coordination des coursiers.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div>
          <label className="font-semibold text-foreground flex items-center justify-between mb-1.5">
            <span>Téléphone du pressing</span>
            <span className="text-[10px] text-muted-foreground font-normal">
              Visible coursiers & plateforme
            </span>
          </label>
          <input
            type="tel"
            value={contactPhone}
            onChange={(e) => onChangeContactPhone(e.target.value)}
            placeholder="+243 99 912 3456"
            className="w-full h-10 min-h-[44px] px-3 rounded-xl border border-border text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
          />
          {contactPhone && (
            <span className="text-[10px] text-muted-foreground mt-1 block">
              Format standardisé : {formatPhone(contactPhone)}
            </span>
          )}
        </div>

        <div>
          <label className="font-semibold text-foreground flex items-center justify-between mb-1.5">
            <span>Numéro WhatsApp (optionnel)</span>
            <span className="text-[10px] text-muted-foreground font-normal">
              Coordination rapide
            </span>
          </label>
          <input
            type="tel"
            value={whatsAppPhone}
            onChange={(e) => onChangeWhatsAppPhone(e.target.value)}
            placeholder="+243..."
            className="w-full h-10 min-h-[44px] px-3 rounded-xl border border-border text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary font-mono"
          />
        </div>
      </div>

      <div>
        <label className="font-semibold text-foreground flex items-center justify-between mb-1.5">
          <span className="flex items-center gap-1.5">
            <MapPin className="size-3.5 text-primary" />
            <span>Repère d&apos;accès pour les coursiers</span>
          </span>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            Confidentiel coursiers
          </span>
        </label>
        <textarea
          value={addressNote}
          onChange={(e) => onChangeAddressNote(e.target.value)}
          placeholder="Ex. Avenue Patrice Lumumba, à côté de la pharmacie du Lac, portail vert métallique..."
          maxLength={250}
          rows={2}
          className="w-full p-3 rounded-xl border border-border text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
        <span className="text-[10px] text-muted-foreground block text-right mt-0.5">
          {addressNote.length} / 250 caractères
        </span>
      </div>

      {/* GPS coordinates with link to external map */}
      <div className="pt-2 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label className="font-semibold text-foreground block mb-1">
            Coordonnées GPS (Latitude, Longitude)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="Lat"
              className="w-1/2 h-9 px-2.5 rounded-lg border border-border text-xs font-mono"
            />
            <input
              type="text"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="Lng"
              className="w-1/2 h-9 px-2.5 rounded-lg border border-border text-xs font-mono"
            />
          </div>
        </div>
        <div className="flex items-end">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-semibold h-9 py-2"
          >
            <span>Vérifier le repère sur la carte</span>
            <ExternalLink className="size-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
