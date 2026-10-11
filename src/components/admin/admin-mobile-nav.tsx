"use client";

import { useState, useEffect, useRef } from "react";
import { Menu, X } from "lucide-react";
import { AdminSidebar } from "./admin-sidebar";
import { Button } from "@/components/ui/button";

export function AdminMobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const prevIsOpen = useRef(isOpen);

  // Restore focus to trigger button on close
  useEffect(() => {
    if (prevIsOpen.current && !isOpen) {
      triggerRef.current?.focus();
    }
    prevIsOpen.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    // Focus first focusable element inside drawer when opened
    const drawerEl = drawerRef.current;
    if (drawerEl) {
      const focusable = drawerEl.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length > 0) {
        focusable[0].focus();
      } else {
        drawerEl.focus();
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setIsOpen(false);
        return;
      }

      if (e.key === "Tab") {
        const dialog = drawerRef.current;
        if (!dialog) return;

        const focusableElements = Array.from(
          dialog.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => el.offsetParent !== null || el.getClientRects().length > 0);

        if (focusableElements.length === 0) {
          e.preventDefault();
          return;
        }

        const firstEl = focusableElements[0];
        const lastEl = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstEl || !dialog.contains(document.activeElement)) {
            e.preventDefault();
            lastEl.focus();
          }
        } else {
          if (document.activeElement === lastEl || !dialog.contains(document.activeElement)) {
            e.preventDefault();
            firstEl.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <div className="md:hidden">
      <Button
        ref={triggerRef}
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        aria-label="Ouvrir le menu d'administration"
        aria-expanded={isOpen}
        className="touch text-slate-800"
      >
        <Menu className="size-5" />
      </Button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu d'administration"
          className="fixed inset-0 z-50 flex"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs animate-fade-in"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer */}
          <div
            ref={drawerRef}
            tabIndex={-1}
            className="relative z-50 w-72 bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-200 outline-hidden"
          >
            <div className="p-3 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2">
                Menu Admin
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                aria-label="Fermer le menu"
                className="size-8 rounded-lg"
              >
                <X className="size-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <AdminSidebar onNavigate={() => setIsOpen(false)} className="w-full border-r-0" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
