import { getTranslations } from "next-intl/server";
import { listAdminUsers } from "@/services/admin";
import { UsersTable } from "@/components/admin/users/users-table";
import { MergeGuestForm } from "@/components/admin/users/merge-guest-form";

export default async function AdminCustomersPage() {
  const t = await getTranslations("admin.nav");
  const res = await listAdminUsers({ role: "customer", limit: 100 });
  const customers = res.ok ? res.value : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-heading tracking-tight">
          {t("customers")}
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Liste des clients enregistrés et invités avec possibilité de fusion
        </p>
      </div>

      <MergeGuestForm />
      <UsersTable initialUsers={customers} isCustomerView={true} />
    </div>
  );
}
