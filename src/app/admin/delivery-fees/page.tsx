import { getTranslations } from "next-intl/server";
import { listAdminZoneFees, listAdminZones } from "@/services/admin";
import { FeeMatrixTable } from "@/components/admin/delivery-fees/fee-matrix-table";
import { FeePairForm } from "@/components/admin/delivery-fees/fee-pair-form";

export default async function AdminDeliveryFeesPage() {
  const t = await getTranslations("admin.deliveryFees");

  const [feesRes, zonesRes] = await Promise.all([
    listAdminZoneFees(),
    listAdminZones(),
  ]);

  const zoneFees = feesRes.ok ? feesRes.value : [];
  const zones = zonesRes.ok ? zonesRes.value : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-heading tracking-tight">
          {t("title")}
        </h1>
        <p className="text-xs text-muted-foreground mt-1">{t("subtitle")}</p>
      </div>

      <FeePairForm zones={zones} />
      <FeeMatrixTable zoneFees={zoneFees} />
    </div>
  );
}
