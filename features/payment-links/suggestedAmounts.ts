/** Backend: max 12 suggested amounts, each > 0, deduped, 2 decimal places. */

const MAX_SUGGESTED = 12;

export function parseSuggestedAmountsFromInput(raw: string): number[] {
  if (!raw.trim()) return [];
  const parts = raw
    .split(/[\s,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const out: number[] = [];
  const seen = new Set<string>();
  for (const p of parts) {
    const n = Number(p);
    if (!Number.isFinite(n) || n <= 0) continue;
    const rounded = Math.round(n * 100) / 100;
    const key = String(rounded);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(rounded);
    if (out.length >= MAX_SUGGESTED) break;
  }
  return out;
}

/** Product default when API returns no suggestedAmounts (XAF). */
export const DEFAULT_PAYER_CHOICE_CHIPS_XAF: ReadonlyArray<number> = [100, 200, 500, 1000, 2000];

export function effectivePayerChoiceChips(
  suggestedAmounts: number[] | null | undefined,
  currency: string
): number[] {
  if (suggestedAmounts && suggestedAmounts.length > 0) {
    return [...suggestedAmounts];
  }
  if (currency === "XAF") {
    return [...DEFAULT_PAYER_CHOICE_CHIPS_XAF];
  }
  return [1, 5, 10, 25, 50];
}
