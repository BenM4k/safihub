"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { UserRecord } from "@/dal";
import { UnblockButton, UserActionModals } from "./user-actions-dialogs";

interface UsersTableProps {
  initialUsers: UserRecord[];
  isCustomerView?: boolean;
}

export function UsersTable({ initialUsers, isCustomerView = false }: UsersTableProps) {
  const t = useTranslations("admin.users");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState(isCustomerView ? "customer" : "all");
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [modalMode, setModalMode] = useState<"block" | "reset" | null>(null);

  const filteredUsers = initialUsers.filter((u) => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = u.name.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchPhone = u.contactPhone?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchPhone) return false;
    }
    return true;
  });

  return (
    <div className="bg-white rounded-xl border border-border shadow-xs overflow-hidden space-y-4">
      <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Input
          placeholder={t("searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-9 text-xs sm:w-80"
        />

        {!isCustomerView && (
          <div className="flex items-center gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-9 rounded-md border border-input bg-white px-3 text-xs text-heading"
            >
              <option value="all">{t("roleAll")}</option>
              <option value="customer">{t("roleCustomer")}</option>
              <option value="courier">{t("roleCourier")}</option>
              <option value="house">{t("roleHouse")}</option>
              <option value="admin">{t("roleAdmin")}</option>
            </select>
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 border-b border-border text-muted-foreground font-semibold">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Téléphone</th>
              <th className="px-4 py-3">Rôle</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  Aucun utilisateur trouvé.
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/60 transition">
                  <td className="px-4 py-3 font-semibold text-heading">
                    {u.name}
                    {u.isGuest && (
                      <span className="ml-2 text-[10px] font-normal px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        Invité
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-[11px]">{u.email}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.contactPhone || "—"}</td>
                  <td className="px-4 py-3 capitalize font-semibold">{u.role}</td>
                  <td className="px-4 py-3">
                    {u.banned || u.status === "blocked" ? (
                      <Badge variant="outline" className="bg-red-50 text-destructive border-red-200">
                        Bloqué
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                        Actif
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(u);
                          setModalMode("reset");
                        }}
                        className="h-7 text-xs text-primary"
                      >
                        MDP
                      </Button>
                      {u.banned || u.status === "blocked" ? (
                        <UnblockButton userId={u.id} />
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(u);
                            setModalMode("block");
                          }}
                          className="h-7 text-xs text-destructive hover:bg-red-50"
                        >
                          Bloquer
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <UserActionModals
        user={selectedUser}
        mode={modalMode}
        onClose={() => {
          setSelectedUser(null);
          setModalMode(null);
        }}
      />
    </div>
  );
}
