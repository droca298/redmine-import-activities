const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function normalizeSpentOn(raw: string): string | undefined {
  const trimmed = raw.trim();
  if (ISO_DATE_RE.test(trimmed)) return trimmed;

  // Accept dd/mm/yyyy as a common Excel/Spanish locale fallback.
  const match = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match) {
    const [, d, m, y] = match;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }
  return undefined;
}

export function isValidDateRange(from: string, to: string): boolean {
  return ISO_DATE_RE.test(from) && ISO_DATE_RE.test(to) && from <= to;
}
