import { ExternalLink, MapPin } from "lucide-react";
import { formatPhone } from "@/lib/order-formatters";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface ContactLocationCardProps {
  contactPhone: string;
  whatsAppPhone: string;
  addressNote: string;
  onChangeContactPhone: (val: string) => void;
  onChangeAddressNote: (val: string) => void;
}

export function ContactLocationCard({
  contactPhone,
  whatsAppPhone,
  addressNote,
  onChangeContactPhone,
  onChangeAddressNote,
}: ContactLocationCardProps) {
  const latitude = "-2.5085";
  const longitude = "28.8617";

  return (
    <section className="py-2 space-y-4">
      <div>
        <h2 className="text-sm font-bold text-foreground">Contact & Localisation</h2>
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
          <Input
            type="tel"
            value={contactPhone}
            onChange={(e) => onChangeContactPhone(e.target.value)}
            placeholder="+243 99 912 3456"
            className="text-xs font-mono h-10 sm:h-9 rounded-xl"
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
              Bientôt disponible
            </span>
          </label>
          <Input
            type="tel"
            value={whatsAppPhone || ""}
            disabled
            placeholder="+243..."
            className="text-xs font-mono h-10 sm:h-9 rounded-xl bg-muted/50 cursor-not-allowed"
          />
        </div>
      </div>

      <div>
        <label className="font-semibold text-foreground flex items-center justify-between mb-1.5">
          <span className="flex items-center gap-1.5">
            <MapPin className="size-3.5 text-primary" />
            <span>Repère d&apos;accès pour les coursiers</span>
          </span>
          <Badge variant="outline" className="border-amber-500/30 text-amber-800 dark:text-amber-300 text-[10px] font-bold rounded-md">
            Confidentiel coursiers
          </Badge>
        </label>
        <Textarea
          value={addressNote}
          onChange={(e) => onChangeAddressNote(e.target.value)}
          placeholder="Ex. Avenue Patrice Lumumba, à côté de la pharmacie du Lac, portail vert métallique..."
          maxLength={250}
          rows={2}
          className="text-xs resize-none rounded-xl"
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
            <Input
              type="text"
              value={latitude}
              disabled
              placeholder="Lat"
              className="w-1/2 text-xs font-mono bg-muted/50 cursor-not-allowed h-10 sm:h-9 rounded-xl"
            />
            <Input
              type="text"
              value={longitude}
              disabled
              placeholder="Lng"
              className="w-1/2 text-xs font-mono bg-muted/50 cursor-not-allowed h-10 sm:h-9 rounded-xl"
            />
          </div>
        </div>
        <div className="flex items-end">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-semibold h-10 sm:h-9 py-2"
          >
            <span>Vérifier le repère sur la carte</span>
            <ExternalLink className="size-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
