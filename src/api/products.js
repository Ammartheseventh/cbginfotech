import { seedIfEmpty } from '../data/store';
import { products as productsSeed } from '../data/products';
import { getCategoryName } from '../data/categories';

function getAll() {
  const stored = seedIfEmpty('products', productsSeed);
  return Array.isArray(stored) ? stored : productsSeed;
}

/*
 * Fetch products, optionally filtered.
 *
 * In-memory filtering for now. When the backend is live, this becomes:
 *   return request(`/api/products?${new URLSearchParams(filters)}`);
 */
export async function getProducts(filters = {}) {
  const { category, brand, q, sort } = filters;
  const query = (q ?? '').trim().toLowerCase();

  let result = getAll();

  // Filtering
  if (category || brand || query) {
    result = result.filter((p) => {
      if (category && p.category !== category) return false;
      if (brand && p.brand !== brand) return false;
      if (query && !matchesQuery(p, query)) return false;
      return true;
    });
  }

  // Sorting (only when explicitly requested)
  if (sort) {
    result = [...result].sort((a, b) => {
      switch (sort) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        default:
          return 0;
      }
    });
  }

  return result;
}

// Search matching — checks name, part number, brand, category name,
// description, and spec values.
function matchesQuery(product, query) {
  const categoryName = getCategoryName(product.category).toLowerCase();
  const specValues = Object.values(product.specs ?? {})
    .join(' ')
    .toLowerCase();

  const haystack = [
    product.name,
    product.partNumber,
    product.brand,
    categoryName,
    product.description,
    specValues,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(query);
}

export async function getProductById(id) {
  return getAll().find((p) => p.id === Number(id)) ?? null;
}

export async function getFeatured(limit = 5) {
  return getAll().filter((p) => p.isFeatured).slice(0, limit);
}

export async function getLatest(limit = 5) {
  return [...getAll()]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);
}

export async function getBrands() {
  return [...new Set(getAll().map((p) => p.brand))].sort();
}

export async function getRelated(product, limit = 4) {
  const pool = getAll().filter((p) => p.id !== product.id);

  const sameCategoryAndBrand = pool.filter(
    (p) => p.category === product.category && p.brand === product.brand
  );
  const sameCategoryOnly = pool.filter(
    (p) => p.category === product.category && p.brand !== product.brand
  );
  const sameBrandOnly = pool.filter(
    (p) => p.brand === product.brand && p.category !== product.category
  );
  const featured = pool.filter(
    (p) =>
      p.isFeatured &&
      p.category !== product.category &&
      p.brand !== product.brand
  );

  const result = [];
  const seen = new Set();

  const addUnique = (list) => {
    for (const p of list) {
      if (result.length >= limit) break;
      if (!seen.has(p.id)) {
        seen.add(p.id);
        result.push(p);
      }
    }
  };

  addUnique(sameCategoryAndBrand);
  addUnique(sameCategoryOnly);
  addUnique(sameBrandOnly);
  addUnique(featured);

  if (result.length < limit) {
    addUnique(pool);
  }

  return result;
}