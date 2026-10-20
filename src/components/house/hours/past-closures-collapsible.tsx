"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useTranslations } from "next-intl";
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
    <div className="border-t border-border bg-surface/30">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
      >
        <span>
          {isOpen ? t("hidePastClosures") : t("pastClosures")} ({pastClosures.length})
        </span>
        {isOpen ? (
          <ChevronUp className="size-4" aria-hidden="true" />
        ) : (
          <ChevronDown className="size-4" aria-hidden="true" />
        )}
      </button>

      {isOpen && (
        <div className="divide-y divide-border border-t border-border bg-card">
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
      )}
    </div>
  );
}
