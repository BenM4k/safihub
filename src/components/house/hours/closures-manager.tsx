"use client";

import { useState, useTransition } from "react";
import { PlusCircle, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  addHouseClosureAction,
  updateHouseClosureAction,
  deleteHouseClosureAction,
  importHouseHolidaysAction,
} from "@/actions/house.actions";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ConfirmDialog } from "@/components/shared";
import { ClosuresList } from "./closures-list";
import { ClosureModal } from "./closure-modal";
import { HolidaysImportModal } from "./holidays-import-modal";
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
    const res = editingClosure
      ? await updateHouseClosureAction({ closureId: editingClosure.id, ...data, houseId })
      : await addHouseClosureAction({ ...data, houseId });

    if (res.ok) {
      setSuccessMsg(editingClosure ? t("closureUpdateSuccess") : t("closureAddSuccess"));
      setTimeout(() => setSuccessMsg(null), 3000);
    }
    return res;
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
    <div className="space-y-4 py-2">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-3">
        <div>
          <h2 className="text-base font-bold text-heading font-display">{t("closuresTitle")}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{t("closuresSubtitle")}</p>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto flex-wrap sm:flex-nowrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsHolidaysModalOpen(true)}
            disabled={isPending}
            className="h-10 sm:h-9 px-3.5 rounded-xl text-xs font-semibold border-primary text-primary hover:bg-primary/10 cursor-pointer flex-1 sm:flex-initial"
          >
            <Sparkles className="size-3.5 mr-1.5 text-primary" aria-hidden="true" />
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
            className="h-10 sm:h-9 px-4 rounded-xl bg-primary hover:bg-primary-hover text-primary-foreground font-bold text-xs shadow-xs cursor-pointer flex-1 sm:flex-initial"
          >
            <PlusCircle className="size-3.5 mr-1.5" aria-hidden="true" />
            <span>{t("addClosure")}</span>
          </Button>
        </div>
      </div>

      {errorMsg && (
        <Alert variant="destructive" className="py-2.5">
          <AlertDescription className="text-xs font-semibold">{errorMsg}</AlertDescription>
        </Alert>
      )}
      {successMsg && (
        <Alert className="py-2.5 bg-success-soft text-success border-success/30">
          <AlertDescription className="text-xs font-semibold text-success">{successMsg}</AlertDescription>
        </Alert>
      )}

      <ClosuresList
        closuresList={closuresList}
        activeAndUpcoming={activeAndUpcoming}
        pastClosures={pastClosures}
        disabled={isPending}
        onEdit={(item) => {
          setEditingClosure(item);
          setIsAddModalOpen(true);
        }}
        onDelete={(id) => setDeletingClosureId(id)}
        onAddClosure={() => setIsAddModalOpen(true)}
      />

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
        cancelLabel={t("cancel")}
        variant="destructive"
      />
    </div>
  );
}
