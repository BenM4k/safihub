import { formatDateTime } from "@/lib/order-formatters";
import { escapeCsvCell } from "@/lib/csv-utils";
import { formatUserEmail, getRoleBadgeInfo } from "@/lib/user-formatters";
import type { UserRow } from "./types";

export interface UserExportLabels {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  house?: string;
  status?: string;
  lastLogin?: string;
  createdAt?: string;
  blocked?: string;
  invited?: string;
  active?: string;
  neverLoggedIn?: string;
}

export function exportUsersCsv(
  users: UserRow[],
  labels?: UserExportLabels,
  filename = "safihub-utilisateurs.csv"
) {
  const headers = [
    labels?.id ?? "ID Utilisateur",
    labels?.name ?? "Nom complet",
    labels?.email ?? "E-mail",
    labels?.phone ?? "Téléphone",
    labels?.role ?? "Rôle",
    labels?.house ?? "Pressing associé",
    labels?.status ?? "Statut",
    labels?.lastLogin ?? "Dernière connexion",
    labels?.createdAt ?? "Date de création",
  ];

  const rows = users.map((u) => {
    const isBlocked = u.banned || u.status === "blocked";
    const statusLabel = isBlocked
      ? (labels?.blocked ?? "Bloqué")
      : u.status === "invitation_sent"
        ? (labels?.invited ?? "Invitation envoyée")
        : (labels?.active ?? "Actif");
    const roleInfo = getRoleBadgeInfo(u.role);

    return [
      escapeCsvCell(u.id, { alwaysQuote: true }),
      escapeCsvCell(u.name, { alwaysQuote: true }),
      escapeCsvCell(formatUserEmail(u.email), { alwaysQuote: true }),
      escapeCsvCell(u.contactPhone || "—", { alwaysQuote: true }),
      escapeCsvCell(roleInfo.label, { alwaysQuote: true }),
      escapeCsvCell(u.houseName || "—", { alwaysQuote: true }),
      escapeCsvCell(statusLabel, { alwaysQuote: true }),
      escapeCsvCell(
        u.lastLoginAt ? formatDateTime(u.lastLoginAt) : (labels?.neverLoggedIn ?? "Jamais connecté"),
        { alwaysQuote: true }
      ),
      escapeCsvCell(formatDateTime(u.createdAt), { alwaysQuote: true }),
    ].join(",");
  });

  const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
