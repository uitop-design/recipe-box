const FRACTIONS: Record<string, string> = {
  "0.25": "\u00bc",
  "0.33": "\u2153",
  "0.5": "\u00bd",
  "0.67": "\u2154",
  "0.75": "\u00be",
};

/** Scale an ingredient quantity from the base number of servings to the target one. */
export function scaleQuantity(
  quantity: number | null | undefined,
  baseServings: number,
  targetServings: number,
): number | null {
  if (quantity == null) return null;
  if (baseServings <= 0 || targetServings <= 0) {
    throw new RangeError("Servings must be positive");
  }
  const value = (quantity * targetServings) / baseServings;
  return Math.round(value * 100) / 100;
}

/** Human friendly quantity: 1.5 -> "1 ½", 0.25 -> "¼", 250 -> "250". */
export function formatQuantity(value: number | null): string {
  if (value == null) return "";
  if (value >= 10) return String(Math.round(value));
  const whole = Math.floor(value);
  const rest = Math.round((value - whole) * 100) / 100;
  const fraction = FRACTIONS[String(rest)];
  if (rest === 0) return String(whole);
  if (fraction) return whole > 0 ? `${whole} ${fraction}` : fraction;
  return String(value);
}
