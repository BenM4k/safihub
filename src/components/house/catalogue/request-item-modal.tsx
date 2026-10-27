"use client";

import { useState, useTransition } from "react";
import { PlusCircle, Loader2, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { requestCatalogueItemAction } from "@/actions/house.actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function RequestItemModal({ houseId }: { houseId?: string }) {
  const t = useTranslations("house.catalogue");
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [kind, setKind] = useState<"item" | "fabric">("item");
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  function handleOpenChange(open: boolean) {
    setIsOpen(open);
    if (!open) {
      setErrorMsg(null);
      setSuccessMsg(null);
      setName("");
      setNote("");
    }
  }

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
        setSuccessMsg(t("requestSuccess"));
        setName("");
        setNote("");
        setTimeout(() => {
          handleOpenChange(false);
        }, 1500);
      }
    });
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="h-10 sm:h-9 w-full sm:w-auto text-xs font-semibold rounded-xl border-primary text-primary hover:bg-primary/10 hover:text-primary"
        >
          <PlusCircle className="size-3.5 mr-1.5 text-primary" />
          <span>{t("requestItem")}</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-heading">
            {t("requestItemTitle")}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {t("requestItemDesc")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              {t("kindLabel")}
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={kind === "item" ? "default" : "outline"}
                size="sm"
                onClick={() => setKind("item")}
                className="text-xs font-semibold"
              >
                {t("kindItem")}
              </Button>
              <Button
                type="button"
                variant={kind === "fabric" ? "default" : "outline"}
                size="sm"
                onClick={() => setKind("fabric")}
                className="text-xs font-semibold"
              >
                {t("kindFabric")}
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="item-name" className="text-xs font-semibold text-foreground">
              {t("nameLabel")}
            </Label>
            <Input
              id="item-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("namePlaceholder")}
              className="text-base sm:text-xs rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="item-note" className="text-xs font-semibold text-foreground">
              {t("noteLabel")}
            </Label>
            <Textarea
              id="item-note"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("notePlaceholder")}
              className="text-base sm:text-xs resize-none rounded-xl"
            />
          </div>

          {errorMsg && (
            <p className="text-xs text-destructive font-medium">{errorMsg}</p>
          )}
          {successMsg && (
            <p className="text-xs text-success font-medium">{successMsg}</p>
          )}

          <DialogFooter className="flex flex-row items-center justify-end gap-2.5 pt-3 border-t border-border sm:space-x-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
              className="flex-1 sm:flex-initial h-10 sm:h-9 text-xs font-semibold rounded-xl"
            >
              {t("close")}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending || !name.trim()}
              className="flex-1 sm:flex-initial h-10 sm:h-9 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold text-xs rounded-xl shadow-xs"
            >
              {isPending ? (
                <Loader2 className="size-3.5 animate-spin mr-1" />
              ) : (
                <Send className="size-3.5 mr-1" />
              )}
              <span>{t("submitRequest")}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
