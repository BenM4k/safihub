"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { NeighborhoodRecord } from "@/dal";

interface SaveSearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  neighborhoods: NeighborhoodRecord[];
  selectedNeighborhoodId?: string | null;
  initialNeighborhoodId?: string | null;
}

export function SaveSearchDialog({
  isOpen,
  onClose,
  neighborhoods,
  selectedNeighborhoodId,
  initialNeighborhoodId,
}: SaveSearchDialogProps) {
  const t = useTranslations("customerHouses");
  const [phone, setPhone] = useState("");
  const [neighborhoodId, setNeighborhoodId] = useState(
    selectedNeighborhoodId || initialNeighborhoodId || (neighborhoods[0]?.id ?? "")
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    // Submission is disabled until persistent subscription server action is implemented
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => { if (!open) onClose(); }}>
      <DialogContent className="w-full max-w-md rounded-3xl bg-card border border-border shadow-2xl p-6">
        <DialogHeader className="flex flex-row items-center gap-2.5 space-y-0 text-left">
          <div className="size-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0">
            <Bell className="size-5" />
          </div>
          <div>
            <DialogTitle className="text-base font-bold text-heading">
              {t("alertModalTitle")}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
              {t("alertModalDesc")}
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5 pt-2">
            <label htmlFor="save-search-phone" className="text-xs font-bold text-foreground block">
              {t("phoneLabel")}
            </label>
            <input
              id="save-search-phone"
              type="tel"
              required
              placeholder="+243 999 000 000"
              value={phone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-card text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="save-search-neighborhood" className="text-xs font-bold text-foreground block">
              {t("neighborhoodLabel")}
            </label>
            <Select
              value={neighborhoodId}
              onValueChange={(val: string) => setNeighborhoodId(val)}
            >
              <SelectTrigger
                id="save-search-neighborhood"
                className="w-full h-auto px-3.5 py-2.5 rounded-xl border border-border bg-card text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
              >
                <SelectValue placeholder={t("neighborhoodLabel")} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {neighborhoods.map((n) => (
                    <SelectItem key={n.id} value={n.id} className="bg-card text-foreground">
                      {n.name} ({n.zoneName || "Bukavu"})
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-3">
            <Button
              type="submit"
              variant="primary"
              disabled
              className="w-full py-2.5 rounded-xl font-bold text-xs opacity-60 cursor-not-allowed"
            >
              {t("subscribeAlert")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
