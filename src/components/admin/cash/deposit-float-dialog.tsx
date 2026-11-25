"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  holdCourierDepositAction,
  releaseCourierDepositAction,
  issueCourierFloatAction,
  returnCourierFloatAction,
} from "@/actions/admin-cash.actions";
import { Coins, AlertCircle } from "lucide-react";

interface DepositFloatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  courier: {
    courierId: string;
    name: string | null;
    securityDeposit: number;
    changeFloat: number;
  };
}

export function DepositFloatDialog({ isOpen, onClose, courier }: DepositFloatDialogProps) {
  const t = useTranslations("admin.cash");
  const router = useRouter();

  const [operation, setOperation] = useState<"hold_deposit" | "release_deposit" | "issue_float" | "return_float">("issue_float");
  const [amount, setAmount] = useState<number>(10000);
  const [note, setNote] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;
    setLoading(true);
    setErrorMsg(null);

    const payload = {
      courierId: courier.courierId,
      amount: Number(amount),
      currency: "CDF" as const,
      note: note.trim() || undefined,
    };

    let res;
    if (operation === "hold_deposit") res = await holdCourierDepositAction(payload);
    else if (operation === "release_deposit") res = await releaseCourierDepositAction(payload);
    else if (operation === "issue_float") res = await issueCourierFloatAction(payload);
    else res = await returnCourierFloatAction(payload);

    setLoading(false);
    if (!res.ok) {
      setErrorMsg(res.error || "Erreur de validation");
      return;
    }

    router.refresh();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-foreground font-bold text-sm">
            <Coins className="size-4.5 text-primary" aria-hidden="true" />
            <DialogTitle>{t("depositFloatDialogTitle")}</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            {t("depositFloatDialogDesc")} ({courier.name ?? courier.courierId})
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <Alert variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
            </Alert>
          )}

          <div className="p-3 bg-muted/40 rounded-xl text-xs space-y-1.5 border border-border">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("deposit")} :</span>
              <span className="font-bold font-mono text-foreground">{courier.securityDeposit.toLocaleString("fr-FR")} CDF</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("float")} :</span>
              <span className="font-bold font-mono text-foreground">{courier.changeFloat.toLocaleString("fr-FR")} CDF</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">
              {t("operationType")}
            </Label>
            <Select
              value={operation}
              onValueChange={(val) =>
                setOperation(
                  val as
                    | "hold_deposit"
                    | "release_deposit"
                    | "issue_float"
                    | "return_float"
                )
              }
            >
              <SelectTrigger
                className="w-full min-h-11 h-11 text-xs font-medium"
                aria-label={t("operationType")}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="issue_float">{t("opIssueFloat")}</SelectItem>
                <SelectItem value="return_float">{t("opReturnFloat")}</SelectItem>
                <SelectItem value="hold_deposit">{t("opHoldDeposit")}</SelectItem>
                <SelectItem value="release_deposit">
                  {t("opReleaseDeposit")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="deposit-amount-input" className="text-xs font-semibold text-foreground">
              {t("amountLabel")} (CDF)
            </Label>
            <Input
              id="deposit-amount-input"
              type="number"
              min={1}
              required
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="text-sm font-semibold h-10 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="deposit-note-input" className="text-xs font-semibold text-foreground">
              {t("noteLabel")}
            </Label>
            <Input
              id="deposit-note-input"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("notePlaceholder")}
              className="text-xs h-10"
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={loading}
              className="h-10 px-4 text-xs font-semibold"
            >
              {t("cancelBtn")}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading}
              className="h-10 px-4 text-xs font-semibold"
            >
              {loading ? "Enregistrement..." : t("submitBtn")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
