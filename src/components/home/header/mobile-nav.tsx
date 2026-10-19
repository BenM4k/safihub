"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileNavDrawer } from "./mobile-nav-drawer";
import type { AuthenticatedUser } from "@/services/auth/guards";

export function MobileNav({ user }: { user?: AuthenticatedUser | null } = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const tNav = useTranslations("nav");

  const toggle = () => setIsOpen((prev) => !prev);
  const close = () => setIsOpen(false);

  return (
    <div className="md:hidden">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={toggle}
        aria-label={isOpen ? tNav("closeMenu") : tNav("openMenu")}
        aria-expanded={isOpen}
        className="touch text-heading"
      >
        {isOpen ? <X className="size-6" /> : <Menu className="size-6" />}
      </Button>

      <MobileNavDrawer isOpen={isOpen} onClose={close} user={user} />
    </div>
  );
}
