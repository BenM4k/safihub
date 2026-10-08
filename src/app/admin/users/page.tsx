import { getTranslations } from "next-intl/server";
import { listAdminHouses, listAdminUsers } from "@/services/admin";
import { UsersTable } from "@/components/admin/users/users-table";
import { CreateStaffForm } from "@/components/admin/users/create-staff-form";
import { MergeGuestForm } from "@/components/admin/users/merge-guest-form";

export default async function AdminUsersPage() {
  const t = await getTranslations("admin.users");
  const [usersRes, housesRes] = await Promise.all([
    listAdminUsers({ limit: 100 }),
    listAdminHouses(),
  ]);
  const users = usersRes.ok ? usersRes.value : [];
  const houses = housesRes.ok ? housesRes.value : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-heading tracking-tight">
          {t("title")}
        </h1>
        <p className="text-xs text-muted-foreground mt-1">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CreateStaffForm houses={houses} />
        <MergeGuestForm />
      </div>

      <UsersTable initialUsers={users} />
    </div>
  );
}
