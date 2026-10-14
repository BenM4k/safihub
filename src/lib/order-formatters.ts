import type { OrderSource, OrderStatus } from "@/services/db/schema";

/**
 * Formats a monetary amount in Congolese Francs (or specified currency)
 * with French thousand separators: e.g. "18 000 CDF".
 */
export function formatAmount(amount: number | null | undefined, currency: string = "CDF"): string {
  if (typeof amount !== "number" || isNaN(amount)) {
    return `0 ${currency}`;
  }
  // Replace non-breaking / narrow non-breaking spaces with standard space for uniform display and test assertions
  const formattedNumber = Math.round(amount)
    .toLocaleString("fr-FR")
    .replace(/[\u202F\u00A0]/g, " ");

  return `${formattedNumber} ${currency}`;
}

/**
 * Formats DRC phone numbers into international standard format: "+243 99 123 4567".
 * Handles formats: "+243991234567", "0991234567", "991234567", "+243 999 000 001", etc.
 */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return "—";

  // Strip all non-numeric characters
  const digits = phone.replace(/\D/g, "");

  let nationalDigits = "";

  if (digits.startsWith("243") && digits.length === 12) {
    nationalDigits = digits.slice(3);
  } else if (digits.startsWith("0") && digits.length === 10) {
    nationalDigits = digits.slice(1);
  } else if (digits.length === 9) {
    nationalDigits = digits;
  } else if (digits.startsWith("243") && digits.length > 12) {
    nationalDigits = digits.slice(3, 12);
  }

  // Congolese numbers have a 2-digit network code + 3 digits + 4 digits
  if (nationalDigits.length === 9) {
    const network = nationalDigits.slice(0, 2);
    const middle = nationalDigits.slice(2, 5);
    const last = nationalDigits.slice(5, 9);
    return `+243 ${network} ${middle} ${last}`;
  }

  // Fallback for foreign or incomplete numbers: preserve original clean string
  return phone.trim();
}

/**
 * Formats order code into a short readable reference (e.g. #1042 or #0001).
 * Avoids showing giant raw UUIDs in the table while maintaining full traceability.
 */
export function formatOrderReference(code: string | null | undefined, fallbackId?: string): string {
  if (!code && !fallbackId) return "#---";
  const source = code || fallbackId || "";
  // Strip prefixes such as "ORD-", "SAF-" if present
  const cleaned = source.replace(/^(ORD|SAF)-/i, "");
  if (cleaned.length > 8) {
    return `#${cleaned.slice(0, 8)}`;
  }
  return `#${cleaned}`;
}

/**
 * Formats relative time elapsed in French: "à l'instant", "il y a 15 min", "il y a 2 h", "il y a 3 j".
 */
export function formatRelativeTime(
  dateInput: Date | string | number | null | undefined,
  now: Date = new Date()
): string {
  if (!dateInput) return "—";
  const date = typeof dateInput === "object" && dateInput instanceof Date
    ? dateInput
    : new Date(dateInput);

  const diffMs = now.getTime() - date.getTime();
  if (isNaN(diffMs)) return "—";

  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) {
    return "à l'instant";
  }

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return `il y a ${diffMin} min`;
  }

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) {
    return `il y a ${diffHours} h`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) {
    return `il y a ${diffDays} j`;
  }

  const diffMonths = Math.floor(diffDays / 30);
  return `il y a ${diffMonths} mois`;
}

/**
 * Formats a Date into French short date & time: "14 oct. 2026, 13:45".
 */
export function formatDateTime(dateInput: Date | string | number | null | undefined): string {
  if (!dateInput) return "—";
  const date = typeof dateInput === "object" && dateInput instanceof Date
    ? dateInput
    : new Date(dateInput);

  if (isNaN(date.getTime())) return "—";

  const formatted = date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Lubumbashi",
  });

  return formatted;
}

export type StatusCategory = "pending" | "progress" | "delivered" | "cancelled" | "draft";

export interface StatusConfig {
  label: string;
  category: StatusCategory;
  dotClass: string;
  badgeClass: string;
}

/**
 * Maps every OrderStatus enum value to its French label, category, and WCAG AA compliant colors.
 * Never relies on colour alone: returns explicit label and distinct category dot.
 */
export const ORDER_STATUS_CONFIG: Record<OrderStatus, StatusConfig> = {
  // Amber / En attente
  created: {
    label: "En attente",
    category: "pending",
    dotClass: "bg-warning-base",
    badgeClass: "bg-warning-light text-warning-base border-warning-base/20",
  },
  price_adjusted: {
    label: "Prix ajusté",
    category: "pending",
    dotClass: "bg-warning-base",
    badgeClass: "bg-warning-light text-warning-base border-warning-base/20",
  },

  // Blue / En cours
  accepted: {
    label: "Acceptée",
    category: "progress",
    dotClass: "bg-primary",
    badgeClass: "bg-primary-soft text-primary-soft-foreground border-primary/20",
  },
  pickup_assigned: {
    label: "Collecte assignée",
    category: "progress",
    dotClass: "bg-primary",
    badgeClass: "bg-primary-soft text-primary-soft-foreground border-primary/20",
  },
  pickup_in_progress: {
    label: "Collecte en cours",
    category: "progress",
    dotClass: "bg-primary",
    badgeClass: "bg-primary-soft text-primary-soft-foreground border-primary/20",
  },
  picked_up: {
    label: "Collectée",
    category: "progress",
    dotClass: "bg-primary",
    badgeClass: "bg-primary-soft text-primary-soft-foreground border-primary/20",
  },
  received: {
    label: "Reçue au pressing",
    category: "progress",
    dotClass: "bg-primary",
    badgeClass: "bg-primary-soft text-primary-soft-foreground border-primary/20",
  },
  washing: {
    label: "En cours de lavage",
    category: "progress",
    dotClass: "bg-primary",
    badgeClass: "bg-primary-soft text-primary-soft-foreground border-primary/20",
  },
  ready: {
    label: "Prête pour livraison",
    category: "progress",
    dotClass: "bg-primary",
    badgeClass: "bg-primary-soft text-primary-soft-foreground border-primary/20",
  },
  delivery_slot_confirmed: {
    label: "Créneau confirmé",
    category: "progress",
    dotClass: "bg-primary",
    badgeClass: "bg-primary-soft text-primary-soft-foreground border-primary/20",
  },
  delivery_assigned: {
    label: "Livraison assignée",
    category: "progress",
    dotClass: "bg-primary",
    badgeClass: "bg-primary-soft text-primary-soft-foreground border-primary/20",
  },
  delivery_in_progress: {
    label: "Livraison en cours",
    category: "progress",
    dotClass: "bg-primary",
    badgeClass: "bg-primary-soft text-primary-soft-foreground border-primary/20",
  },

  // Green / Livrée
  delivered: {
    label: "Livrée",
    category: "delivered",
    dotClass: "bg-success-base",
    badgeClass: "bg-success-light text-success-base border-success-base/20",
  },

  // Red / Annulée ou Problème
  cancelled: {
    label: "Annulée",
    category: "cancelled",
    dotClass: "bg-destructive-base",
    badgeClass: "bg-destructive-light text-destructive-base border-destructive-base/20",
  },
  rejected: {
    label: "Refusée",
    category: "cancelled",
    dotClass: "bg-destructive-base",
    badgeClass: "bg-destructive-light text-destructive-base border-destructive-base/20",
  },
  expired: {
    label: "Expirée",
    category: "cancelled",
    dotClass: "bg-destructive-base",
    badgeClass: "bg-destructive-light text-destructive-base border-destructive-base/20",
  },
  pickup_failed: {
    label: "Collecte échouée",
    category: "cancelled",
    dotClass: "bg-destructive-base",
    badgeClass: "bg-destructive-light text-destructive-base border-destructive-base/20",
  },
  price_declined: {
    label: "Ajustement refusé",
    category: "cancelled",
    dotClass: "bg-destructive-base",
    badgeClass: "bg-destructive-light text-destructive-base border-destructive-base/20",
  },
  delivery_failed: {
    label: "Livraison échouée",
    category: "cancelled",
    dotClass: "bg-destructive-base",
    badgeClass: "bg-destructive-light text-destructive-base border-destructive-base/20",
  },
  disputed: {
    label: "En litige",
    category: "cancelled",
    dotClass: "bg-destructive-base",
    badgeClass: "bg-destructive-light text-destructive-base border-destructive-base/20",
  },

  // Gray / Brouillon ou confirmation initiale
  awaiting_confirmation: {
    label: "En confirmation",
    category: "draft",
    dotClass: "bg-ink-400",
    badgeClass: "bg-ink-100 text-ink-700 border-ink-200",
  },
};

export function getOrderStatusConfig(status: OrderStatus): StatusConfig {
  return (
    ORDER_STATUS_CONFIG[status] || {
      label: status.replace(/_/g, " "),
      category: "draft",
      dotClass: "bg-ink-400",
      badgeClass: "bg-ink-100 text-ink-700 border-ink-200",
    }
  );
}

/**
 * Formats customer identity for admin table display.
 * Strips synthetic placeholders like "Registered Customer" or "Guest Phone Customer".
 */
export function formatCustomerDisplay(
  customerName: string | null | undefined,
  phone: string | null | undefined
): {
  displayName: string | null;
  isGuest: boolean;
  formattedPhone: string;
} {
  const formattedPhone = formatPhone(phone);
  const rawName = customerName?.trim() || "";

  const isSyntheticPlaceholder =
    !rawName ||
    /^(registered customer|guest phone customer|guest customer|guest|client invité|client)$/i.test(
      rawName
    );

  if (isSyntheticPlaceholder) {
    return {
      displayName: null,
      isGuest: true,
      formattedPhone,
    };
  }

  return {
    displayName: rawName,
    isGuest: false,
    formattedPhone,
  };
}

export interface SourceConfig {
  label: string;
  iconName: "app" | "whatsapp" | "phone" | "manual";
}

/**
 * Returns neutral channel tag details.
 */
export function getSourceConfig(source: OrderSource | string): SourceConfig {
  switch (source) {
    case "whatsapp":
      return { label: "WhatsApp", iconName: "whatsapp" };
    case "phone":
      return { label: "Téléphone", iconName: "phone" };
    case "app":
      return { label: "App", iconName: "app" };
    default:
      return { label: "Saisie manuelle", iconName: "manual" };
  }
}

/**
 * Exports orders to a browser-downloadable CSV with UTF-8 BOM for Excel compatibility.
 */
export function exportOrdersToCSV(
  orders: Array<{
    id: string;
    code: string;
    customerName?: string | null;
    customerPhone: string;
    houseName?: string | null;
    createdAt: Date | string;
    source: OrderSource | string;
    totalDue: number;
    currency: string;
    status: OrderStatus;
  }>
): void {
  const headers = [
    "Référence",
    "Identifiant UUID",
    "Nom Client",
    "Téléphone",
    "Pressing",
    "Date de création",
    "Canal",
    "Montant",
    "Devise",
    "Statut",
  ];

  function sanitizeCsvCell(value: string | number | null | undefined): string {
    if (value === null || value === undefined) return '""';
    if (typeof value === "number") return String(value);
    let str = String(value);
    if (/^[=+\-@]/.test(str)) {
      str = `'${str}`;
    }
    return `"${str.replace(/"/g, '""')}"`;
  }

  const rows = orders.map((o) => {
    const cust = formatCustomerDisplay(o.customerName, o.customerPhone);
    const statusCfg = getOrderStatusConfig(o.status);
    const dateStr = new Date(o.createdAt).toISOString();

    return [
      sanitizeCsvCell(formatOrderReference(o.code, o.id)),
      sanitizeCsvCell(o.id),
      sanitizeCsvCell(cust.displayName || "Client"),
      sanitizeCsvCell(cust.formattedPhone),
      sanitizeCsvCell(o.houseName || "—"),
      sanitizeCsvCell(dateStr),
      sanitizeCsvCell(o.source),
      o.totalDue,
      sanitizeCsvCell(o.currency),
      sanitizeCsvCell(statusCfg.label),
    ].join(",");
  });

  const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const timestamp = new Date().toISOString().slice(0, 10);
  link.setAttribute("href", url);
  link.setAttribute("download", `safihub-commandes-${timestamp}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

