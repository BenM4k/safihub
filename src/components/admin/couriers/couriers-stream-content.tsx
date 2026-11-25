import { getTranslations } from "next-intl/server";
import { AlertCircle } from "lucide-react";
import { listAdminCouriers } from "@/services/admin";
import type { AdminCouriersQueryParams } from "@/lib/admin-couriers-query";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CourierCreateForm } from "./courier-create-form";
import { CouriersTable } from "./couriers-table";

interface CouriersStreamContentProps {
  query: AdminCouriersQueryParams;
}

export async function CouriersStreamContent({
  query,
}: CouriersStreamContentProps) {
  const [t, res] = await Promise.all([
    getTranslations("admin.couriers"),
    listAdminCouriers(),
  ]);

  if (!res.ok) {
    return (
      <Alert variant="destructive" className="animate-enter">
        <AlertCircle className="size-4" />
        <AlertDescription className="text-xs">
          {res.error || t("loadError")}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <CourierCreateForm />
      <CouriersTable couriers={res.value} query={query} />
    </div>
  );
}
