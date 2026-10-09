"use client";

import { useTranslations } from "next-intl";
import { AlertCircle, X, RefreshCw, Trash2 } from "lucide-react";
import { useCourierStore, type ConflictItem } from "@/lib/stores/courier-store";
import { Button } from "@/components/ui/button";

interface ConflictResolutionDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConflictResolutionDialog({
  isOpen,
  onClose,
}: ConflictResolutionDialogProps) {
  const t = useTranslations("courier.sync");
  const conflicts = useCourierStore((s) => s.conflicts);
  const discardConflict = useCourierStore((s) => s.discardConflict);
  const retryConflicts = useCourierStore((s) => s.retryConflicts);
  const clearResolvedConflicts = useCourierStore((s) => s.clearResolvedConflicts);
  const syncQueue = useCourierStore((s) => s.syncQueue);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2 text-rose-600 font-semibold text-sm">
            <AlertCircle className="size-4.5" />
            <span>{t("conflictsTitle")}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50"
            aria-label={t("dismiss")}
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-3">
          {conflicts.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-6">
              {t("allSynced")}
            </p>
          ) : (
            conflicts.map((item: ConflictItem) => (
              <div
                key={item.actionId}
                className="p-3.5 bg-rose-50/60 border border-rose-200/80 rounded-xl space-y-2 text-xs"
              >
                <div className="flex items-center justify-between text-slate-900 font-medium">
                  <span className="uppercase text-[10px] tracking-wider px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded font-bold">
                    {item.action.type.replace("_", " ")}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(item.action.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <p className="text-rose-900 font-medium leading-relaxed">
                  {item.message}
                </p>

                <div className="flex items-center justify-end gap-2 pt-1 border-t border-rose-100">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => discardConflict(item.actionId)}
                    className="h-7 px-2 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-100/60"
                  >
                    <Trash2 className="size-3 mr-1" />
                    <span>{t("discard")}</span>
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-2">
          {conflicts.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => clearResolvedConflicts()}
              className="text-xs h-8"
            >
              {t("dismiss")}
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => {
              retryConflicts();
              syncQueue();
              onClose();
            }}
            className="text-xs h-8 ml-auto bg-blue-600 hover:bg-blue-700 text-white"
          >
            <RefreshCw className="size-3 mr-1.5" />
            <span>{t("retry")}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
