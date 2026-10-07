"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight, Phone, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen((prev) => !prev);
  const close = () => setIsOpen(false);

  return (
    <div className="md:hidden">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={toggle}
        aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
        aria-expanded={isOpen}
        className="touch text-heading"
      >
        {isOpen ? <X className="size-6" /> : <Menu className="size-6" />}
      </Button>

      {isOpen && (
        <div className="fixed inset-0 top-20 z-50 bg-background/95 backdrop-blur-md animate-fade-in flex flex-col justify-between p-6 overflow-y-auto">
          <nav className="flex flex-col gap-5 text-lg font-bold tracking-tight">
            <Link
              href="/#services"
              onClick={close}
              className="link-quiet py-2 border-b border-border text-heading flex items-center justify-between"
            >
              Services de Pressing
              <ArrowRight className="size-4 text-muted-foreground" />
            </Link>
            <Link
              href="/#how-it-works"
              onClick={close}
              className="link-quiet py-2 border-b border-border text-heading flex items-center justify-between"
            >
              Comment ça marche
              <ArrowRight className="size-4 text-muted-foreground" />
            </Link>
            <Link
              href="/#catalogue"
              onClick={close}
              className="link-quiet py-2 border-b border-border text-heading flex items-center justify-between"
            >
              Tarifs & Catalogue
              <ArrowRight className="size-4 text-muted-foreground" />
            </Link>
            <Link
              href="/#zones"
              onClick={close}
              className="link-quiet py-2 border-b border-border text-heading flex items-center justify-between"
            >
              Zones à Bukavu
              <ArrowRight className="size-4 text-muted-foreground" />
            </Link>
            <Link
              href="/#faq"
              onClick={close}
              className="link-quiet py-2 border-b border-border text-heading flex items-center justify-between"
            >
              Questions fréquentes
              <ArrowRight className="size-4 text-muted-foreground" />
            </Link>
          </nav>

          <div className="flex flex-col gap-3 pt-6 border-t border-border mt-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Phone className="size-4 text-primary" />
              <span>Assistance Bukavu : +243 999 000 123</span>
            </div>
            <Button asChild variant="primary" size="lg" className="w-full">
              <Link href="/#catalogue" onClick={close}>
                <Sparkles className="size-4 mr-1" />
                Commander maintenant
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/login" onClick={close}>
                Espace Partenaire Pressing
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
