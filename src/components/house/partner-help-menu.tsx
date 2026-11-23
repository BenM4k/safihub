"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HelpCircle, RotateCcw, MessageSquare, ChevronDown } from "lucide-react";
import { toast } from "@ui-sdk/react/toast";
import { resetOnboardingTourAction } from "@/actions/partner-onboarding.actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getSupportWhatsAppUrl } from "@/lib/support-config";

interface PartnerHelpMenuProps {
  houseSlug: string;
}

export function PartnerHelpMenu({ houseSlug }: PartnerHelpMenuProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  async function handleReplayTour() {
    setIsResetting(true);
    try {
      const res = await resetOnboardingTourAction();
      if (!res.ok) {
        toast.error("Impossible de redémarrer la visite.");
        return;
      }
      setIsOpen(false);
      window.dispatchEvent(new CustomEvent("safihub:restart-tour"));
      router.push(`/partner/${houseSlug}?tour=start`);
      toast.info("Visite guidée réinitialisée.");
    } catch {
      toast.error("Erreur de connexion.");
    } finally {
      setIsResetting(false);
    }
  }

  const supportUrl = getSupportWhatsAppUrl(
    `Bonjour SafiHub Support, j'ai besoin d'aide pour la configuration de mon pressing (${houseSlug}).`
  );

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger
        aria-label="Aide et assistance"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-foreground bg-secondary/80 hover:bg-secondary hover:text-heading transition cursor-pointer"
      >
        <HelpCircle className="size-4 text-primary" />
        <span className="hidden sm:inline">Aide</span>
        <ChevronDown className="size-3 text-muted-foreground" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        aria-label="Menu d'aide"
        className="w-56 rounded-2xl bg-card border border-border shadow-lift py-1.5 px-0 font-sans"
      >
        <div className="px-3.5 py-1.5 border-b border-border/70">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Assistance pressing
          </p>
        </div>

        <DropdownMenuItem
          disabled={isResetting}
          onSelect={handleReplayTour}
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-foreground rounded-none cursor-pointer"
        >
          <RotateCcw className="size-4 text-primary shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="truncate">Revoir la visite guidée</span>
            <span className="text-[10px] text-muted-foreground font-normal">
              Reprendre depuis le début
            </span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem
          asChild
          className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-foreground rounded-none cursor-pointer"
        >
          <a href={supportUrl} target="_blank" rel="noopener noreferrer">
            <MessageSquare className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="truncate">Contacter le support</span>
              <span className="text-[10px] text-muted-foreground font-normal">
                Via WhatsApp Bukavu
              </span>
            </div>
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
