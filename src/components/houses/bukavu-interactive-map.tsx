"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Minus, Pencil, Star, X, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import type { CustomerHouseSummary } from "@/dal";

interface BukavuInteractiveMapProps {
  houses: CustomerHouseSummary[];
  hoveredHouseId: string | null;
  onHoverHouse: (id: string | null) => void;
  selectedHouseId: string | null;
  onSelectHouse: (id: string | null) => void;
}

export function BukavuInteractiveMap({
  houses,
  hoveredHouseId,
  onHoverHouse,
  selectedHouseId,
  onSelectHouse,
}: BukavuInteractiveMapProps) {
  const t = useTranslations("customerHouses");
  const [mapType, setMapType] = useState<"map" | "satellite">("satellite");
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDrawing, setIsDrawing] = useState(false);

  const activeHouse = houses.find((h) => h.id === (selectedHouseId || hoveredHouseId));

  // Map coordinates normalization for Bukavu viewport:
  // Center: ~ -2.510, 28.855
  // Lat span: -2.47 (North / Bagira) to -2.55 (South / Panzi) -> delta ~0.08
  // Lng span: 28.81 (West) to 28.88 (East / Lake) -> delta ~0.07
  const getMapPositionPercent = (lat: number, lng: number) => {
    const minLat = -2.55;
    const maxLat = -2.47;
    const minLng = 28.81;
    const maxLng = 28.88;

    const x = Math.max(8, Math.min(92, ((lng - minLng) / (maxLng - minLng)) * 100));
    // Invert Y because latitude increases North, but CSS top increases South
    const y = Math.max(8, Math.min(92, ((maxLat - lat) / (maxLat - minLat)) * 100));

    return { left: `${x}%`, top: `${y}%` };
  };

  return (
    <div className="relative w-full h-full min-h-[450px] bg-slate-900 overflow-hidden select-none">
      {/* Map Background Layer: Styled Satellite / Topo Surface */}
      <div
        className={`absolute inset-0 transition-all duration-700 ${
          mapType === "satellite"
            ? "bg-[#182a38] opacity-100"
            : "bg-[#e5e9ec] opacity-100"
        }`}
        style={{
          transform: `scale(${zoomLevel})`,
          transformOrigin: "center center",
        }}
      >
        {/* Lake Kivu representation */}
        <div
          className={`absolute top-0 right-0 w-[55%] h-[65%] rounded-bl-[120px] transition-colors ${
            mapType === "satellite" ? "bg-[#0b1f33]/90" : "bg-[#a5c9eb]"
          }`}
        >
          <div className="absolute top-8 right-8 text-[11px] font-bold tracking-widest uppercase opacity-40 text-cyan-200">
            Lac Kivu (Bukavu)
          </div>
        </div>

        {/* Shoreline & Topo Grid */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />

        {/* Bukavu Communes Boundary Labels */}
        <div className="absolute top-[28%] left-[16%] text-[10px] font-bold tracking-wider uppercase text-white/40">
          Commune de Bagira
        </div>
        <div className="absolute top-[52%] left-[28%] text-[10px] font-bold tracking-wider uppercase text-white/40">
          Commune de Kadutu
        </div>
        <div className="absolute top-[68%] left-[48%] text-[10px] font-bold tracking-wider uppercase text-white/40">
          Commune d&apos;Ibanda
        </div>
      </div>

      {/* Top Map Controls: Draw and Satellite/Map Segmented */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsDrawing((prev) => !prev)}
          className={`h-8 px-3 rounded-full text-xs font-bold inline-flex items-center gap-1.5 shadow-md backdrop-blur-md transition ${
            isDrawing
              ? "bg-primary text-white"
              : "bg-white/95 text-slate-800 hover:bg-white"
          }`}
        >
          <Pencil className="size-3.5" />
          <span>{t("drawArea")}</span>
        </button>
      </div>

      <div className="absolute top-4 right-4 z-20">
        <div className="inline-flex p-0.5 bg-white/95 backdrop-blur-md shadow-md rounded-full text-xs font-bold text-slate-700">
          <button
            type="button"
            onClick={() => setMapType("map")}
            className={`px-3 py-1 rounded-full transition ${
              mapType === "map" ? "bg-slate-900 text-white shadow-2xs" : "hover:text-slate-900"
            }`}
          >
            {t("mapPlan")}
          </button>
          <button
            type="button"
            onClick={() => setMapType("satellite")}
            className={`px-3 py-1 rounded-full transition ${
              mapType === "satellite" ? "bg-slate-900 text-white shadow-2xs" : "hover:text-slate-900"
            }`}
          >
            {t("mapSatellite")}
          </button>
        </div>
      </div>

      {/* Bottom-left Zoom Controls */}
      <div className="absolute bottom-6 left-4 z-20 flex flex-col gap-1.5">
        <button
          type="button"
          onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
          className="size-8 rounded-full bg-white/95 backdrop-blur-md shadow-md text-slate-800 flex items-center justify-center hover:bg-white transition"
          aria-label={t("zoomIn")}
        >
          <Plus className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.1))}
          className="size-8 rounded-full bg-white/95 backdrop-blur-md shadow-md text-slate-800 flex items-center justify-center hover:bg-white transition"
          aria-label={t("zoomOut")}
        >
          <Minus className="size-4" />
        </button>
      </div>

      {/* House Markers on Bukavu coordinates */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {houses.map((house) => {
          const pos = getMapPositionPercent(house.coords.lat, house.coords.lng);
          const isSelected = house.id === (selectedHouseId || hoveredHouseId);

          return (
            <div
              key={house.id}
              style={{ left: pos.left, top: pos.top }}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto transition-transform duration-200"
            >
              <button
                type="button"
                onClick={() => onSelectHouse(house.id === selectedHouseId ? null : house.id)}
                onMouseEnter={() => onHoverHouse(house.id)}
                onMouseLeave={() => onHoverHouse(null)}
                className={`group flex items-center gap-1 px-2.5 py-1 rounded-full font-black text-xs shadow-lg transition-all transform ${
                  isSelected
                    ? "bg-primary text-white scale-115 ring-4 ring-primary/30 z-30"
                    : "bg-white text-slate-900 hover:scale-105 hover:bg-slate-50 z-20"
                }`}
              >
                <span className="size-1.5 rounded-full bg-emerald-500" />
                <span>
                  {house.minimumOrderAmount > 0
                    ? `${Math.round(house.minimumOrderAmount / 1000)}k`
                    : `${Math.round(house.minItemPriceCdf / 1000)}k`}
                </span>
                <span className="text-[10px] opacity-75 font-semibold">CDF</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Active House Preview Popup at Bottom Right matching Zillow/Airbnb style */}
      {activeHouse && (
        <div className="absolute bottom-6 right-4 z-30 w-72 rounded-2xl bg-white p-3 shadow-2xl border border-slate-200/90 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <div className="relative size-12 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                <Image
                  src={activeHouse.imageUrl}
                  alt={activeHouse.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-900 truncate">
                  {activeHouse.name}
                </h4>
                <p className="text-[11px] text-slate-500 truncate">
                  {activeHouse.neighborhoodName}
                </p>
                {activeHouse.rating !== null && (
                  <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600">
                    <Star className="size-3 fill-amber-500 text-amber-500" />
                    <span>{activeHouse.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onSelectHouse(null)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
            >
              <X className="size-3.5" />
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
            <span className="text-xs font-black text-slate-900">
              Min. {activeHouse.minimumOrderAmount.toLocaleString("fr-FR")} CDF
            </span>
            <Link
              href={`/houses/${activeHouse.id}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-hover shadow-2xs transition"
            >
              <span>{t("selectHouse")}</span>
              <Sparkles className="size-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
