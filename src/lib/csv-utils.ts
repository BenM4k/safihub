export interface EscapeCsvCellOptions {
  alwaysQuote?: boolean;
}

/**
 * Neutralizes spreadsheet formula injection (including leading whitespace/control chars)
 * and escapes values for RFC 4180 CSV cells.
 */
export function escapeCsvCell(
  value: unknown,
  options?: EscapeCsvCellOptions
): string {
  const alwaysQuote = options?.alwaysQuote ?? false;
  if (value === null || value === undefined) {
    return alwaysQuote ? '""' : "";
  }

  let str = value instanceof Date ? value.toISOString() : String(value);

  // Guard against spreadsheet formula execution (including leading whitespace / control chars)
  if (/^[\s\u0000-\u001F]*[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  if (
    alwaysQuote ||
    str.includes(",") ||
    str.includes(";") ||
    str.includes('"') ||
    str.includes("\n") ||
    str.includes("\r")
  ) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}
