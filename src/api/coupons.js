import { sanity } from './sanity';

/*
 * Validate a coupon code.
 * Returns the coupon object, or null if invalid.
 */
export async function validateCoupon(code) {
  const normalized = (code ?? '').trim().toUpperCase();
  if (!normalized) return null;

  const doc = await sanity.fetch(
    `*[_type == 'coupon' && code == $code][0] {
      code,
      type,
      value
    }`,
    { code: normalized }
  );

  return doc ?? null;
}

/*
 * Calculate the discount amount for a coupon against a subtotal.
 * Percent coupons round to 2 decimals. Fixed coupons are capped at the subtotal.
 */
export function calculateDiscount(coupon, subtotal) {
  if (!coupon) return 0;
  if (coupon.type === 'percent') {
    return Math.round((subtotal * coupon.value) / 100 * 100) / 100;
  }
  if (coupon.type === 'fixed') {
    return Math.min(coupon.value, subtotal);
  }
  return 0;
}