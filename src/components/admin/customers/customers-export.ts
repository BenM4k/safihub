import { formatCustomerEmail, formatCustomerName } from "@/lib/customer-formatters";
import { formatPhone } from "@/lib/order-formatters";
import type { CustomerRow } from "./types";

function escapeCsvField(value: string | null | undefined): string {
  if (!value) return '""';
  let str = value;
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  return `"${str.replace(/"/g, '""')}"`;
}

export function exportCustomersCsv(customers: CustomerRow[]): void {
  const headers = [
    "Nom",
    "Téléphone",
    "Email",
    "Type",
    "Statut",
    "Commandes",
    "Total dépensé (CDF)",
    "Dernière commande",
    "Inscrit le",
  ];

  const rows = customers.map((c) => {
    const name = formatCustomerName(c.name, c.contactPhone);
    const phone = formatPhone(c.contactPhone);
    const email = formatCustomerEmail(c.email);
    const type = c.isGuest ? "Invité" : "Inscrit";
    const status = c.banned || c.status === "blocked" ? "Bloqué" : "Actif";
    const lastOrder = c.lastOrderAt
      ? new Date(c.lastOrderAt).toLocaleDateString("fr-FR")
      : "—";
    const registered = new Date(c.createdAt).toLocaleDateString("fr-FR");

    return [
      escapeCsvField(name),
      escapeCsvField(phone),
      escapeCsvField(email),
      `"${type}"`,
      `"${status}"`,
      `"${c.ordersCount}"`,
      `"${c.totalSpentCDF}"`,
      `"${lastOrder}"`,
      `"${registered}"`,
    ].join(";");
  });

  const csvContent = "\uFEFF" + [headers.join(";"), ...rows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const today = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `clients-safihub-${today}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
