"use client";

import { useState, useTransition } from "react";
import { Calendar, PlusCircle, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  addHouseClosureAction,
  updateHouseClosureAction,
  deleteHouseClosureAction,
  importHouseHolidaysAction,
} from "@/actions/house.actions";
import { Button } from "@/components/ui/button";
import { ConfirmDialog, EmptyState } from "@/components/shared";
import { ClosureCard } from "./closure-card";
import { ClosureModal } from "./closure-modal";
import { HolidaysImportModal } from "./holidays-import-modal";
import { PastClosuresCollapsible } from "./past-closures-collapsible";
import { getClosureStatus, type ClosureItem } from "@/lib/hours-utils";
import type { HouseClosureRecord } from "@/dal";

interface ClosuresManagerProps {
  closures: HouseClosureRecord[];
  waitingOrdersCount?: number;
  houseId?: string;
}

export function ClosuresManager({
  closures: initialClosures,
  waitingOrdersCount = 0,
  houseId,
}: ClosuresManagerProps) {
  const t = useTranslations("house.hours");
  const [isPending, startTransition] = useTransition();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isHolidaysModalOpen, setIsHolidaysModalOpen] = useState(false);
  const [editingClosure, setEditingClosure] = useState<ClosureItem | null>(null);
  const [deletingClosureId, setDeletingClosureId] = useState<string | null>(null);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const closuresList: ClosureItem[] = initialClosures.map((c) => ({
    id: c.id,
    startsOn: c.startsOn,
    endsOn: c.endsOn,
    reason: c.reason,
    createdAt: c.createdAt,
  }));

  const activeAndUpcoming = closuresList
    .filter((c) => getClosureStatus(c) !== "past")
    .sort((a, b) => a.startsOn.localeCompare(b.startsOn));

  const pastClosures = closuresList
    .filter((c) => getClosureStatus(c) === "past")
    .sort((a, b) => b.startsOn.localeCompare(a.startsOn));

  async function handleSaveClosure(data: { startsOn: string; endsOn: string; reason?: string }) {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (editingClosure) {
      const res = await updateHouseClosureAction({
        closureId: editingClosure.id,
        startsOn: data.startsOn,
        endsOn: data.endsOn,
        reason: data.reason,
        houseId,
      });
      if (res.ok) {
        setSuccessMsg(t("closureUpdateSuccess"));
        setTimeout(() => setSuccessMsg(null), 3000);
      }
      return res;
    } else {
      const res = await addHouseClosureAction({
        startsOn: data.startsOn,
        endsOn: data.endsOn,
        reason: data.reason,
        houseId,
      });
      if (res.ok) {
        setSuccessMsg(t("closureAddSuccess"));
        setTimeout(() => setSuccessMsg(null), 3000);
      }
      return res;
    }
  }

  async function handleImportHolidays(holidays: Array<{ startsOn: string; endsOn: string; reason: string }>) {
    setErrorMsg(null);
    setSuccessMsg(null);

    const res = await importHouseHolidaysAction({ holidays, houseId });
    if (res.ok) {
      setSuccessMsg(t("holidaysImportSuccess", { count: res.value.importedCount }));
      setTimeout(() => setSuccessMsg(null), 3000);
    }
    return res;
  }

  function handleConfirmDelete() {
    if (!deletingClosureId) return;
    const targetId = deletingClosureId;
    setDeletingClosureId(null);
    setErrorMsg(null);

    startTransition(async () => {
      const res = await deleteHouseClosureAction({ closureId: targetId, houseId });
      if (!res.ok) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg(t("closureDeleteSuccess"));
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    });
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-4 sm:p-6 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-3">
        <div>
          <h2 className="text-base font-bold text-heading font-display">{t("closuresTitle")}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{t("closuresSubtitle")}</p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsHolidaysModalOpen(true)}
            disabled={isPending}
            className="h-9 px-3 text-xs font-semibold bg-surface border-border hover:bg-card text-foreground cursor-pointer shadow-2xs"
          >
            <Sparkles className="size-3.5 text-primary mr-1.5" aria-hidden="true" />
            <span>{t("importHolidays")}</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => {
              setEditingClosure(null);
              setIsAddModalOpen(true);
            }}
            disabled={isPending}
            className="h-9 px-3 bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs shadow-xs cursor-pointer"
          >
            <PlusCircle className="size-3.5 mr-1.5" aria-hidden="true" />
            <span>{t("addClosure")}</span>
          </Button>
        </div>
      </div>

      {errorMsg && (
        <div role="alert" className="p-3 bg-destructive-soft text-destructive rounded-xl border border-destructive/20 text-xs font-semibold">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div role="status" className="p-3 bg-success-soft text-success rounded-xl border border-success/30 text-xs font-semibold">
          {successMsg}
        </div>
      )}

      <div className="border border-border rounded-xl overflow-hidden bg-card">
        {closuresList.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title={t("noClosures")}
            description="Programmez vos jours de fermeture exceptionnelle (inventaire, travaux) ou importez les jours fériés légaux de RDC."
            action={
              <Button
                type="button"
                size="sm"
                onClick={() => setIsAddModalOpen(true)}
                className="bg-primary hover:bg-primary-hover text-primary-foreground text-xs font-bold cursor-pointer"
              >
                <PlusCircle className="size-3.5 mr-1.5" aria-hidden="true" />
                <span>{t("addClosure")}</span>
              </Button>
            }
          />
        ) : (
          <div>
            {activeAndUpcoming.length > 0 ? (
              <div className="divide-y divide-border">
                {activeAndUpcoming.map((c) => (
                  <ClosureCard
                    key={c.id}
                    closure={c}
                    onEdit={(item) => {
                      setEditingClosure(item);
                      setIsAddModalOpen(true);
                    }}
                    onDelete={(id) => setDeletingClosureId(id)}
                    disabled={isPending}
                  />
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-muted-foreground font-medium">
                Aucune fermeture à venir.
              </div>
            )}

            <PastClosuresCollapsible
              pastClosures={pastClosures}
              onEdit={(item) => {
                setEditingClosure(item);
                setIsAddModalOpen(true);
              }}
              onDelete={(id) => setDeletingClosureId(id)}
              disabled={isPending}
            />
          </div>
        )}
      </div>

      <ClosureModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingClosure(null);
        }}
        closureToEdit={editingClosure}
        existingClosures={closuresList}
        waitingOrdersCount={waitingOrdersCount}
        onSave={handleSaveClosure}
      />

      <HolidaysImportModal
        isOpen={isHolidaysModalOpen}
        onClose={() => setIsHolidaysModalOpen(false)}
        onImport={handleImportHolidays}
      />

      <ConfirmDialog
        isOpen={Boolean(deletingClosureId)}
        onClose={() => setDeletingClosureId(null)}
        onConfirm={async () => handleConfirmDelete()}
        title={t("deleteClosureConfirmTitle")}
        description={t("deleteClosureConfirmDesc")}
        confirmLabel={t("deleteClosure")}
        cancelLabel="Annuler"
        variant="destructive"
      />
    </div>
  );
}
