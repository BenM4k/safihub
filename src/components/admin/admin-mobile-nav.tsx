"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { AdminSidebar } from "./admin-sidebar";

export function AdminMobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("admin.nav");

  return (
    <div className="md:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={t("title")}
            className="touch text-ink-900"
          >
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-72 p-0 bg-card border-r border-border shadow-2xl flex flex-col"
        >
          <SheetHeader className="p-3 border-b border-border flex flex-row items-center justify-between space-y-0">
            <SheetTitle className="text-xs font-bold text-ink-500 uppercase tracking-wider px-2">
              {t("title")}
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto">
            <AdminSidebar
              onNavigate={() => setIsOpen(false)}
              className="w-full border-r-0"
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
