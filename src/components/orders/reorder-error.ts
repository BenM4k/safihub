export type ReorderErrorCode =
  | "UNAUTHENTICATED"
  | "ORDER_NOT_FOUND"
  | "ACCESS_DENIED"
  | "HOUSE_NOT_ACTIVE"
  | "ORDER_EMPTY"
  | "NO_ITEMS_AVAILABLE"
  | "REORDER_FAILED";

export type ReorderTranslationKey =
  | "orderAgainUnauthenticated"
  | "orderAgainNotFound"
  | "orderAgainAccessDenied"
  | "orderAgainHouseInactive"
  | "orderAgainOrderEmpty"
  | "orderAgainNoItemsAvailable"
  | "orderAgainError";

/**
 * Translates stable reorder error codes to user-facing localized strings.
 */
export function formatReorderErrorMessage(
  errorCode: ReorderErrorCode | string | undefined,
  t: (key: ReorderTranslationKey) => string
): string {
  switch (errorCode) {
    case "UNAUTHENTICATED":
      return t("orderAgainUnauthenticated");
    case "ORDER_NOT_FOUND":
      return t("orderAgainNotFound");
    case "ACCESS_DENIED":
      return t("orderAgainAccessDenied");
    case "HOUSE_NOT_ACTIVE":
      return t("orderAgainHouseInactive");
    case "ORDER_EMPTY":
      return t("orderAgainOrderEmpty");
    case "NO_ITEMS_AVAILABLE":
      return t("orderAgainNoItemsAvailable");
    default:
      return t("orderAgainError");
  }
}
