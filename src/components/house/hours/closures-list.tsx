"use client";

import { Calendar, PlusCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared";
import { ClosureCard } from "./closure-card";
import { PastClosuresCollapsible } from "./past-closures-collapsible";
import type { ClosureItem } from "@/lib/hours-utils";

interface ClosuresListProps {
  closuresList: ClosureItem[];
  activeAndUpcoming: ClosureItem[];
  pastClosures: ClosureItem[];
  disabled: boolean;
  onEdit: (closure: ClosureItem) => void;
  onDelete: (id: string) => void;
  onAddClosure: () => void;
}

export function ClosuresList({
  closuresList,
  activeAndUpcoming,
  pastClosures,
  disabled,
  onEdit,
  onDelete,
  onAddClosure,
}: ClosuresListProps) {
  const t = useTranslations("house.hours");

  if (closuresList.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title={t("noClosures")}
        description={t("emptyClosuresDesc")}
        action={
          <Button
            type="button"
            size="sm"
            onClick={onAddClosure}
            className="h-10 px-4 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold cursor-pointer"
          >
            <PlusCircle className="size-3.5 mr-1.5" aria-hidden="true" />
            <span>{t("addClosure")}</span>
          </Button>
        }
      />
    );
  }

  return (
    <div className="border border-border/60 rounded-2xl overflow-hidden divide-y divide-border/60 shadow-xs bg-card">
      {activeAndUpcoming.length > 0 ? (
        <div className="divide-y divide-border/60">
          {activeAndUpcoming.map((c) => (
            <ClosureCard
              key={c.id}
              closure={c}
              onEdit={onEdit}
              onDelete={onDelete}
              disabled={disabled}
            />
          ))}
        </div>
      ) : (
        <div className="p-6 text-center text-xs text-muted-foreground font-medium">
          {t("noUpcomingClosures")}
        </div>
      )}

      <PastClosuresCollapsible
        pastClosures={pastClosures}
        onEdit={onEdit}
        onDelete={onDelete}
        disabled={disabled}
      />
    </div>
  );
}
