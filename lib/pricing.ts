// ONE global price in rupees (change this to switch from ₹1 to anything)
export const PRICE_RUPEES =
  Number(process.env.PLANINSTA_PRICE_RUPEES ?? 1);

export function getPriceRupees() {
  return PRICE_RUPEES;
}