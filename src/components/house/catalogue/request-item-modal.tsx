"use client";

import { useState, useTransition } from "react";
import { PlusCircle, X, Loader2, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { requestCatalogueItemAction } from "@/actions/house.actions";
import { Button } from "@/components/ui/button";

export function RequestItemModal({ houseId }: { houseId?: string }) {
  const t = useTranslations("house.catalogue");
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [kind, setKind] = useState<"item" | "fabric">("item");
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg(t("nameLabel"));
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);

    startTransition(async () => {
      const res = await requestCatalogueItemAction({
        kind,
        name: name.trim(),
        note: note.trim() || undefined,
        houseId,
      });

      if (!res.ok) {
        setErrorMsg(res.error);
      } else {
        setSuccessMsg("Demande envoyée à l'administrateur avec succès.");
        setName("");
        setNote("");
        setTimeout(() => {
          setIsOpen(false);
          setSuccessMsg(null);
        }, 1500);
      }
    });
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="text-xs font-semibold rounded-xl border-border hover:bg-surface text-heading shadow-2xs"
      >
        <PlusCircle className="size-3.5 mr-1.5 text-primary" />
        <span>{t("requestItem")}</span>
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl max-w-md w-full p-6 shadow-xl border border-border space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-heading">
                  {t("requestItemTitle")}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("requestItemDesc")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-muted-foreground hover:text-heading p-1 rounded-lg"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  {t("kindLabel")}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setKind("item")}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                      kind === "item"
                        ? "bg-primary-soft text-primary border-primary/30 shadow-xs"
                        : "bg-card text-muted-foreground border-border"
                    }`}
                  >
                    {t("kindItem")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setKind("fabric")}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                      kind === "fabric"
                        ? "bg-primary-soft text-primary border-primary/30 shadow-xs"
                        : "bg-card text-muted-foreground border-border"
                    }`}
                  >
                    {t("kindFabric")}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  {t("nameLabel")}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("namePlaceholder")}
                  className="w-full text-xs rounded-xl border border-border p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  {t("noteLabel")}
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={t("notePlaceholder")}
                  className="w-full text-xs rounded-xl border border-border p-2.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {errorMsg && (
                <p className="text-xs text-destructive font-medium">{errorMsg}</p>
              )}
              {successMsg && (
                <p className="text-xs text-success font-medium">{successMsg}</p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  disabled={isPending}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isPending || !name.trim()}
                  className="bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs"
                >
                  {isPending ? (
                    <Loader2 className="size-3.5 animate-spin mr-1" />
                  ) : (
                    <Send className="size-3.5 mr-1" />
                  )}
                  <span>{t("submitRequest")}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
