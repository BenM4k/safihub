/**
 * Canonical cache tags for Next.js Cache Components (`"use cache"` + `revalidateTag`).
 * See docs/architecture-and-layering.md and docs/ui-and-frontend.md.
 */
export const CACHE_TAGS = {
  catalogItems: "catalog:items",
  coverageZones: "coverage:zones",
  housesList: "houses:list",
  house: (houseIdOrSlug: string) => `house:${houseIdOrSlug}`,
  order: (orderId: string) => `order:${orderId}`,
  courierMissions: (courierId: string) => `courier:missions:${courierId}`,
  adminDispatch: "admin:dispatch",
  adminCash: "admin:cash",
  authSessions: "auth:sessions",
  userSession: (userId: string) => `auth:user:${userId}`,
} as const;
