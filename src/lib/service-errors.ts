import "server-only";

/**
 * Logs full internal errors on the server while returning sanitized user-safe
 * messages (mapping common PostgreSQL constraint codes without leaking SQL/schema details).
 */
export function sanitizeServiceError(
  error: unknown,
  fallbackMessage: string,
  context?: string
): string {
  console.error(context ? `[${context}]` : "[service-error]", error);

  const errObj = error as { code?: unknown; cause?: { code?: unknown } } | null;
  const code =
    typeof errObj?.code === "string"
      ? errObj.code
      : typeof errObj?.cause?.code === "string"
        ? errObj.cause.code
        : undefined;

  if (code === "23505") {
    return "Un enregistrement identique existe déjà.";
  }
  if (code === "23503") {
    return "Référence invalide ou introuvable.";
  }
  if (code === "22P02") {
    return "Format d'identifiant invalide.";
  }

  return fallbackMessage;
}
