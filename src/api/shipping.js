import { sanity } from './sanity';

const DEFAULT_BASE_RATE = 20;

let cachedRates = null;

// Fetch all shipping rates from Sanity and reshape into a map:
// { 'Pulau Pinang': [{ maxKg, price }, ...], ... }
async function getRates() {
  if (cachedRates) return cachedRates;

  const docs = await sanity.fetch(
    `*[_type == 'shippingRate'] {
      state,
      brackets
    }`
  );

  const map = {};
  for (const doc of docs) {
    map[doc.state] = (doc.brackets ?? []).map((b) => ({
      maxKg: b.maxKg === null ? Infinity : b.maxKg,
      price: b.price,
    }));
  }

  cachedRates = map;
  return map;
}

function findBrackets(rates, state) {
  if (rates[state]) return rates[state];

  // Fallback: use the first available state's brackets
  const fallbackKey = Object.keys(rates)[0];
  if (fallbackKey) return rates[fallbackKey];

  // Ultimate fallback: a single flat rate
  return [{ maxKg: Infinity, price: DEFAULT_BASE_RATE }];
}

export async function calculateShipping({ items, state }) {
  const rates = await getRates();
  const brackets = findBrackets(rates, state);

  const totalWeight = items.reduce(
    (sum, i) => sum + (i.weight ?? 0) * i.quantity,
    0
  );

  const bracket = brackets.find((b) => totalWeight <= b.maxKg);

  return {
    price: bracket?.price ?? DEFAULT_BASE_RATE,
    weight: Number(totalWeight.toFixed(2)),
    state,
  };
}