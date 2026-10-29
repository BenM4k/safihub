"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Collapsible,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ClosureCard } from "./closure-card";
import type { ClosureItem } from "@/lib/hours-utils";

interface PastClosuresCollapsibleProps {
  pastClosures: ClosureItem[];
  onEdit: (item: ClosureItem) => void;
  onDelete: (id: string) => void;
  disabled?: boolean;
}

export function PastClosuresCollapsible({
  pastClosures,
  onEdit,
  onDelete,
  disabled = false,
}: PastClosuresCollapsibleProps) {
  const t = useTranslations("house.hours");
  const [isOpen, setIsOpen] = useState(false);

  if (pastClosures.length === 0) return null;

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="border-t border-border/60 pt-1"
    >
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className="w-full px-3 py-2.5 flex items-center justify-between text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <span>
            {isOpen ? t("hidePastClosures") : t("pastClosures")} ({pastClosures.length})
          </span>
          <ChevronDown
            className={`size-4 text-muted-foreground transition-transform duration-500 ease-in-out ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
            aria-hidden="true"
          />
        </button>
      </CollapsibleTrigger>

      <div
        className={`grid transition-all duration-500 ease-in-out ${
          isOpen
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0 pointer-events-none"
        }`}
      >
        <div className="overflow-hidden divide-y divide-border/60">
          {pastClosures.map((c) => (
            <ClosureCard
              key={c.id}
              closure={c}
              onEdit={onEdit}
              onDelete={onDelete}
              disabled={disabled}
            />
          ))}
        </div>
      </div>
    </Collapsible>
  );
}
