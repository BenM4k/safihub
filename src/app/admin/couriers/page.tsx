import { getTranslations } from "next-intl/server";
import { listAdminCouriers } from "@/services/admin";
import { CouriersTable } from "@/components/admin/couriers/couriers-table";
import { CourierCreateForm } from "@/components/admin/couriers/courier-create-form";

export default async function AdminCouriersPage() {
  const t = await getTranslations("admin.couriers");
  const res = await listAdminCouriers();
  const couriers = res.ok ? res.value : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-heading tracking-tight">
          {t("title")}
        </h1>
        <p className="text-xs text-muted-foreground mt-1">{t("subtitle")}</p>
      </div>

      <CourierCreateForm />
      <CouriersTable couriers={couriers} />
    </div>
  );
}
