"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { AdminSidebar } from "./admin-sidebar";
import { Button } from "@/components/ui/button";

export function AdminMobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        aria-label="Ouvrir le menu d'administration"
        className="touch text-slate-800"
      >
        <Menu className="size-5" />
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs animate-fade-in"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer */}
          <div className="relative z-50 w-72 bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-200">
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
