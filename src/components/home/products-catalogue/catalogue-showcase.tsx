"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ShoppingBag, Sparkles, X } from "lucide-react";
import { SAMPLE_COLLECTIONS, SAMPLE_PRODUCTS } from "@/lib/sample-data";
import { CatalogueCard } from "./catalogue-card";
import { Button } from "@/components/ui/button";

export function CatalogueShowcase() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(["prod-1", "prod-2"])
  );

  const toggleProduct = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const filteredProducts =
    activeCategory === "all"
      ? SAMPLE_PRODUCTS
      : SAMPLE_PRODUCTS.filter((p) => p.category === activeCategory);

  const selectedProducts = SAMPLE_PRODUCTS.filter((p) => selectedIds.has(p.id));
  const totalCdf = selectedProducts.reduce((sum, p) => sum + p.priceCdf, 0);
  const totalUsd = selectedProducts.reduce((sum, p) => sum + p.priceUsd, 0);

  return (
    <div className="space-y-8">
      {/* Category Pills Navigation */}
      <div className="flex flex-wrap items-center justify-center gap-2 pb-2">
        {SAMPLE_COLLECTIONS.map((col) => {
          const isActive = activeCategory === col.id;
          return (
            <button
              key={col.id}
              type="button"
              onClick={() => setActiveCategory(col.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all border ${
                isActive
                  ? "bg-heading text-background border-heading shadow-soft scale-102"
                  : "bg-card text-muted-foreground border-border hover:border-heading/40 hover:text-heading"
              }`}
            >
              <span>{col.name}</span>
              <span className="ml-1.5 opacity-60 text-xs">({col.count})</span>
            </button>
          );
        })}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <CatalogueCard
            key={product.id}
            product={product}
            isSelected={selectedIds.has(product.id)}
            onToggle={toggleProduct}
          />
        ))}
      </div>

      {/* Floating Order Simulation Banner */}
      {selectedIds.size > 0 && (
        <div className="sticky bottom-6 z-30 card shadow-lift bg-card/95 backdrop-blur-md border border-primary/30 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto animate-fade-up">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-xl bg-primary text-white flex items-center justify-center shrink-0">
              <ShoppingBag className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-heading text-sm sm:text-base">
                  {selectedIds.size} article{selectedIds.size > 1 ? "s" : ""}{" "}
                  sélectionné{selectedIds.size > 1 ? "s" : ""}
                </span>
                <button
                  type="button"
                  onClick={clearSelection}
                  className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-0.5 ml-1"
                >
                  <X className="size-3" />
                  Effacer
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Total estimé :{" "}
                <strong className="text-primary font-bold tabular text-sm">
                  {totalCdf.toLocaleString("fr-FR")} CDF
                </strong>{" "}
                (≈ {totalUsd.toFixed(2)} USD)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button asChild variant="primary" size="lg" className="w-full sm:w-auto group">
              <Link href="#order">
                <Sparkles className="size-4" />
                <span>Valider la commande</span>
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-1"
                  data-icon="trailing"
                />
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
