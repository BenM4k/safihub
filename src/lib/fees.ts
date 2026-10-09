/**
 * Retry fee (CDF, integer minor units) charged when a pickup must be re-attempted.
 * Lives in lib so both the DAL (transactional failed-pickup flow) and the
 * abuse service can share it without a circular import.
 */
export const DEFAULT_RETRY_FEE_CDF = 2000;

/** Failed-pickup count (per customer) at which the retry fee is charged, once. */
export const RETRY_FEE_FAILED_PICKUP_COUNT = 2;
