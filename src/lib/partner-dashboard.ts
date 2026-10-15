import { toBukavuDateTime } from "@/services/availability";

export interface AcceptanceCountdownResult {
  isExpired: boolean;
  minutesRemaining: number;
  label: string;
  urgency: "normal" | "warning" | "critical" | "expired";
}

/**
 * Calculates live acceptance countdown respecting Bukavu server time.
 * - Amber (< 10 min remaining)
 * - Red (< 5 min remaining)
 * - Expired (<= 0 min remaining)
 */
export function computeOrderAcceptanceCountdown(
  deadline: Date | string | null | undefined,
  now: Date = new Date()
): AcceptanceCountdownResult {
  if (!deadline) {
    return {
      isExpired: false,
      minutesRemaining: 45,
      label: "45 min",
      urgency: "normal",
    };
  }

  const deadlineMs = new Date(deadline).getTime();
  const nowMs = now.getTime();
  const diffMs = deadlineMs - nowMs;
  const minutes = Math.floor(diffMs / (60 * 1000));

  if (diffMs <= 0) {
    const expiredAgo = Math.max(1, Math.abs(Math.floor(diffMs / (60 * 1000))));
    return {
      isExpired: true,
      minutesRemaining: 0,
      label: `Expirée depuis ${expiredAgo} min`,
      urgency: "expired",
    };
  }

  if (minutes < 5) {
    const seconds = Math.max(0, Math.floor((diffMs % (60 * 1000)) / 1000));
    return {
      isExpired: false,
      minutesRemaining: minutes,
      label: `Reste ${minutes} min ${seconds} s`,
      urgency: "critical",
    };
  }

  if (minutes < 10) {
    return {
      isExpired: false,
      minutesRemaining: minutes,
      label: `Reste ${minutes} min`,
      urgency: "warning",
    };
  }

  return {
    isExpired: false,
    minutesRemaining: minutes,
    label: `Reste ${minutes} min`,
    urgency: "normal",
  };
}

/**
 * Acceptance rate definition confirmed by domain:
 * acceptées / (acceptées + refusées + expirées)
 */
export function computeAcceptanceRate(
  accepted: number,
  rejected: number,
  expired: number
): number | null {
  const total = accepted + rejected + expired;
  if (total <= 0) return null;
  return Math.round((accepted / total) * 100);
}

/**
 * Net revenue definition confirmed by domain:
 * commandes livrées montant articles moins commission SafiHub
 */
export function computeNetRevenue(
  itemsTotal: number,
  commissionAmount: number
): number {
  return Math.max(0, Math.round(itemsTotal - commissionAmount));
}

/**
 * Checks operating schedule in Bukavu timezone (CAT UTC+2).
 */
export function computeHouseOpenStatus(params: {
  isPaused: boolean;
  pausedUntil?: Date | string | null;
  hours: Array<{ weekday: number; opensAt: string; closesAt: string }>;
  closures?: Array<{ startsOn: string; endsOn: string }>;
  now?: Date;
}): {
  status: "open" | "closed" | "paused";
  label: string;
  badgeClass: string;
} {
  const { isPaused, pausedUntil, hours, closures = [], now = new Date() } = params;

  if (isPaused) {
    const pausedDate = pausedUntil ? new Date(pausedUntil) : null;
    const label = pausedDate && !isNaN(pausedDate.getTime())
      ? `En pause jusqu'au ${pausedDate.toLocaleDateString("fr-FR")}`
      : "En pause";
    return {
      status: "paused",
      label,
      badgeClass: "bg-warning-soft text-warning border-warning/30",
    };
  }

  const local = toBukavuDateTime(now);
  const todayDateStr = local.dateString;
  const currentWeekday = local.weekday;
  const currentTime = local.timeString;

  // Check scheduled closure
  const isClosedToday = closures.some(
    (c) => todayDateStr >= c.startsOn && todayDateStr <= c.endsOn
  );

  if (isClosedToday) {
    return {
      status: "closed",
      label: "Fermé aujourd'hui",
      badgeClass: "bg-destructive-soft text-destructive border-destructive/30",
    };
  }

  // Find hours for today
  const todaySegments = hours.filter((h) => h.weekday === currentWeekday);
  if (todaySegments.length === 0) {
    return {
      status: "closed",
      label: "Fermé aujourd'hui",
      badgeClass: "bg-destructive-soft text-destructive border-destructive/30",
    };
  }

  // Check if currently inside any segment
  for (const seg of todaySegments) {
    if (currentTime >= seg.opensAt && currentTime <= seg.closesAt) {
      return {
        status: "open",
        label: `Ouvert jusqu'à ${seg.closesAt.slice(0, 5)}`,
        badgeClass: "bg-success-soft text-success border-success/30",
      };
    }
  }

  // Check if before earliest open today
  const sorted = [...todaySegments].sort((a, b) => a.opensAt.localeCompare(b.opensAt));
  const firstOpen = sorted[0];
  if (currentTime < firstOpen.opensAt) {
    return {
      status: "closed",
      label: `Ouvre à ${firstOpen.opensAt.slice(0, 5)}`,
      badgeClass: "bg-secondary text-muted-foreground border-border",
    };
  }

  return {
    status: "closed",
    label: "Fermé",
    badgeClass: "bg-secondary text-muted-foreground border-border",
  };
}

/**
 * Summarizes order clothes items for readable card display.
 */
export function formatOrderItemsSummary(
  items?: Array<{
    itemNameFr?: string | null;
    declaredQuantity: number;
    customLabel?: string | null;
  }> | null
): string {
  if (!items || items.length === 0) {
    return "Articles non détaillés";
  }

  const parts = items
    .slice(0, 3)
    .map((it) => `${it.declaredQuantity} ${it.itemNameFr || it.customLabel || "pièce"}`);

  if (items.length > 3) {
    const extraCount = items.slice(3).reduce((acc, it) => acc + it.declaredQuantity, 0);
    parts.push(`+${extraCount} autre(s)`);
  }

  return parts.join(", ");
}

/**
 * Validates uploaded photo before cropping.
 */
export function validateBannerImageFile(file: File): { ok: true } | { ok: false; error: string } {
  const validTypes = ["image/jpeg", "image/png", "image/webp"];
  if (!validTypes.includes(file.type)) {
    return {
      ok: false,
      error: "Format non supporté. Veuillez choisir une image JPG, PNG ou WebP.",
    };
  }

  const maxSizeBytes = 5 * 1024 * 1024; // 5 MB
  if (file.size > maxSizeBytes) {
    return {
      ok: false,
      error: "Image trop lourde. La taille maximale autorisée est de 5 Mo.",
    };
  }

  return { ok: true };
}
