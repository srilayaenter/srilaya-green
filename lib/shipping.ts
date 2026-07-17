// Simple weight-tier shipping calculation. The original SriLaYa Naturals
// site computes shipping by delivery zone + courier rate card; v1 here
// uses a single flat tier table since there's no courier integration yet.
const FREE_SHIPPING_THRESHOLD = 999;
const TIERS = [
  { maxGrams: 1000, fee: 49 },
  { maxGrams: 5000, fee: 89 },
  { maxGrams: Infinity, fee: 149 },
];

export function calculateShippingFee(totalWeightGrams: number, subtotal: number): number {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  const tier = TIERS.find((t) => totalWeightGrams <= t.maxGrams) ?? TIERS[TIERS.length - 1];
  return tier.fee;
}
