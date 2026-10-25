"use client";

import Image from "next/image";
import { Clock, Plus, Check } from "lucide-react";
import type { ProductItem } from "@/lib/sample-data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CatalogueCardProps {
  product: ProductItem;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

export function CatalogueCard({
  product,
  isSelected,
  onToggle,
}: CatalogueCardProps) {
  return (
    <div
      className={`card card-interactive hover-lift bg-card border transition-all flex flex-col justify-between overflow-hidden group ${
        isSelected
          ? "border-primary ring-2 ring-primary/20 shadow-card"
          : "border-border hover:border-border-strong"
      }`}
    >
      <div>
        {/* Product image container */}
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-muted border border-border/40 mb-4">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Tag badge */}
          {product.tag && (
            <Badge
              variant="secondary"
              className="absolute top-2.5 left-2.5 text-[11px] font-semibold bg-slate-900/80 dark:bg-card/90 text-white dark:text-foreground border border-white/20 dark:border-border backdrop-blur-xs shadow-soft"
            >
              {product.tag}
            </Badge>
          )}

          {/* Turnaround badge */}
          <Badge
            variant="outline"
            className="absolute bottom-2.5 right-2.5 flex items-center gap-1 bg-white/90 dark:bg-card/90 backdrop-blur-sm text-heading text-[11px] font-bold border-border shadow-soft"
          >
            <Clock className="size-3 text-primary" />
            <span>{product.turnaroundHours}h</span>
          </Badge>
        </div>

        {/* Product details */}
        <div className="stack gap-1.5 mb-3">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-base font-bold text-heading leading-tight group-hover:text-primary transition-colors">
              {product.name}
            </h4>
          </div>
          <p className="text-[11px] font-semibold text-primary">
            Tissu : {product.fabric}
          </p>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>
      </div>

      {/* Pricing & Add Action */}
      <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
        <div className="flex flex-col">
          <span className="text-base font-extrabold text-heading tabular">
            {product.priceCdf.toLocaleString("fr-FR")} CDF
          </span>
          <span className="text-[11px] text-muted-foreground font-medium">
            ≈ {product.priceUsd.toFixed(2)} USD
          </span>
        </div>

        <Button
          type="button"
          size="sm"
          variant={isSelected ? "secondary" : "outline"}
          onClick={() => onToggle(product.id)}
          className={`text-xs font-bold transition-all press ${
            !isSelected ? "hover:bg-primary hover:text-white hover:border-primary" : ""
          }`}
          aria-label={
            isSelected ? "Retirer du panier" : "Ajouter à la commande"
          }
        >
          {isSelected ? (
            <>
              <Check className="size-3.5 animate-in scale-in duration-150" />
              <span>Sélectionné</span>
            </>
          ) : (
            <>
              <Plus className="size-3.5" />
              <span>Ajouter</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
