import { formatPhone } from "./order-formatters";

/**
 * Sanitizes customer name display:
 * Replaces synthetic system placeholder names ("Guest Phone Customer", "Client Invité", etc.)
 * with the formatted contact phone or a fallback.
 */
export function formatCustomerName(
  name: string | null | undefined,
  phone?: string | null | undefined
): string {
  const formattedPhone = formatPhone(phone);
  const rawName = name?.trim() || "";

  const isSyntheticPlaceholder =
    !rawName ||
    /^(registered customer|guest phone customer|guest customer|guest|client invité|client)$/i.test(
      rawName
    );

  if (isSyntheticPlaceholder) {
    return formattedPhone !== "—" ? formattedPhone : "Client";
  }

  return rawName;
}

/**
 * Sanitizes customer email display:
 * If the email is a system placeholder like "guest-xxx@guest.invalid", returns "—".
 */
export function formatCustomerEmail(email: string | null | undefined): string {
  if (!email) return "—";
  const trimmed = email.trim();
  if (trimmed.endsWith("@guest.invalid") || trimmed.includes("guest.invalid")) {
    return "—";
  }
  return trimmed;
}

/**
 * Checks if an account corresponds to a test or sandbox account.
 * Since there is no explicit `is_test` column in the database,
 * this inspects common test domains and naming conventions.
 */
export function isTestCustomer(customer: {
  name?: string | null;
  email?: string | null;
  contactPhone?: string | null;
}): boolean {
  const email = (customer.email || "").toLowerCase();
  const name = (customer.name || "").toLowerCase();
  const phone = (customer.contactPhone || "").replace(/\s+/g, "");

  return (
    email.endsWith("@test.invalid") ||
    email.endsWith("@example.com") ||
    email.includes("test@") ||
    email.includes("-fallback-") ||
    email.includes("nonadmin-") ||
    name.includes("test") ||
    phone.includes("000000") ||
    phone === "+243000000000"
  );
}

export interface MergeValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates accounts for the account merge flow.
 * Rules:
 * 1. Source must be a guest account (isGuest === true).
 * 2. Target must be a registered account (isGuest === false).
 * 3. Source and target must not be the same account.
 * 4. Target account must be active and not blocked/banned.
 * 5. Source account must exist and not already be merged.
 */
export function validateMergeCandidates(params: {
  source: {
    id: string;
    isGuest: boolean;
    status: string;
    banned?: boolean | null;
  } | null;
  target: {
    id: string;
    isGuest: boolean;
    status: string;
    banned?: boolean | null;
  } | null;
}): MergeValidationResult {
  if (!params.source) {
    return { valid: false, error: "Veuillez sélectionner un compte invité source." };
  }

  if (!params.target) {
    return { valid: false, error: "Veuillez sélectionner un compte client cible." };
  }

  if (params.source.id === params.target.id) {
    return { valid: false, error: "Impossible de fusionner un compte avec lui-même." };
  }

  if (!params.source.isGuest) {
    return {
      valid: false,
      error: "Le compte source doit être un compte invité.",
    };
  }

  if (params.source.status === "merged") {
    return {
      valid: false,
      error: "Ce compte invité a déjà été fusionné.",
    };
  }

  if (params.target.isGuest) {
    return {
      valid: false,
      error: "Le compte cible ne peut pas être un compte invité. Il doit être inscrit.",
    };
  }

  if (params.target.banned || params.target.status === "blocked") {
    return {
      valid: false,
      error: "Le compte cible est bloqué. Impossible de fusionner vers un compte bloqué.",
    };
  }

  return { valid: true };
}

/**
 * Maps UI filter states to server-side query parameters.
 */
export function mapCustomerFiltersToQuery(filters: {
  search?: string;
  status?: "all" | "active" | "blocked";
  type?: "all" | "registered" | "guest";
  hasOrdered?: boolean;
  hideTestAccounts?: boolean;
  dateFrom?: string;
  dateTo?: string;
}): {
  query?: string;
  status?: string;
  type?: "all" | "registered" | "guest";
  hasOrdered?: boolean;
  hideTestAccounts?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
} {
  return {
    query: filters.search?.trim() || undefined,
    status: filters.status !== "all" ? filters.status : undefined,
    type: filters.type !== "all" ? filters.type : undefined,
    hasOrdered: filters.hasOrdered,
    hideTestAccounts: filters.hideTestAccounts,
    createdAfter: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
    createdBefore: filters.dateTo
      ? new Date(new Date(filters.dateTo).setHours(23, 59, 59, 999))
      : undefined,
  };
}
