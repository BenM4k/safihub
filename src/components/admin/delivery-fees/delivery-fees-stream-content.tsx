import { getTranslations } from "next-intl/server";
import { AlertTriangle } from "lucide-react";
import { listAdminZoneFees, listAdminZones } from "@/services/admin";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FeeMatrixTable } from "./fee-matrix-table";
import { FeePairForm } from "./fee-pair-form";

export async function DeliveryFeesStreamContent() {
  const [t, feesRes, zonesRes] = await Promise.all([
    getTranslations("admin.deliveryFees"),
    listAdminZoneFees(),
    listAdminZones(),
  ]);

  const zoneFees = feesRes.ok ? feesRes.value : [];
  const zones = zonesRes.ok ? zonesRes.value : [];

  return (
    <div className="space-y-6 animate-enter-fast">
      {(!feesRes.ok || !zonesRes.ok) && (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertTitle>{t("errorTitle")}</AlertTitle>
          <AlertDescription className="text-xs">
            {t("errorDescription")}
          </AlertDescription>
        </Alert>
      )}

      <FeePairForm zones={zones} />
      <FeeMatrixTable zoneFees={zoneFees} />
    </div>
  );
}
