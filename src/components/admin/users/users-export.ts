import { formatDateTime } from "@/lib/order-formatters";
import { formatUserEmail, getRoleBadgeInfo } from "@/lib/user-formatters";
import type { UserRow } from "./types";

export function exportUsersCsv(users: UserRow[], filename = "safihub-utilisateurs.csv") {
  const headers = [
    "ID Utilisateur",
    "Nom complet",
    "E-mail",
    "Téléphone",
    "Rôle",
    "Pressing associé",
    "Statut",
    "Dernière connexion",
    "Date de création",
  ];

  const escapeCell = (str: string | null | undefined): string => {
    if (!str) return '""';
    const clean = str.replace(/"/g, '""');
    return `"${clean}"`;
  };

  const rows = users.map((u) => {
    const isBlocked = u.banned || u.status === "blocked";
    const statusLabel = isBlocked
      ? "Bloqué"
      : u.status === "invitation_sent"
        ? "Invitation envoyée"
        : "Actif";
    const roleInfo = getRoleBadgeInfo(u.role);

    return [
      escapeCell(u.id),
      escapeCell(u.name),
      escapeCell(formatUserEmail(u.email)),
      escapeCell(u.contactPhone || "—"),
      escapeCell(roleInfo.label),
      escapeCell(u.houseName || "—"),
      escapeCell(statusLabel),
      escapeCell(u.lastLoginAt ? formatDateTime(u.lastLoginAt) : "Jamais connecté"),
      escapeCell(formatDateTime(u.createdAt)),
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
