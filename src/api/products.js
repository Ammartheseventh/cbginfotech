import { sanity, imageUrl } from './sanity';

// Convert a Sanity spec array [{ key, value }] to an object.
function specsToObject(specs) {
  if (!specs || !Array.isArray(specs)) return {};
  return Object.fromEntries(specs.map((s) => [s.key, s.value]));
}

// Shape a Sanity product document into the shape the frontend expects.
function shapeProduct(doc) {
  return {
    id: doc._id,
    name: doc.name,
    slug: doc.slug,
    partNumber: doc.partNumber,
    brand: doc.brand ?? '',
    category: doc.category?.slug ?? '',
    categoryName: doc.category?.name ?? '',
    price: doc.price,
    weight: doc.weight,
    images: (doc.images ?? []).map(imageUrl).filter(Boolean),
    description: doc.description,
    specs: specsToObject(doc.specs),
    inStock: doc.inStock,
    isFeatured: doc.isFeatured,
    createdAt: doc.createdAt,
  };
}

const PRODUCT_FIELDS = `
  _id,
  name,
  "slug": slug.current,
  partNumber,
  "brand": brand->name,
  "category": category->{ "slug": slug.current, "name": name },
  price,
  weight,
  images,
  description,
  specs,
  inStock,
  isFeatured,
  createdAt
`;

export async function getProducts(filters = {}) {
  const { category, brand, q, sort } = filters;

  const conditions = [];
  if (category) conditions.push(`category->slug.current == $category`);
  if (brand) conditions.push(`brand->name == $brand`);
  if (q) {
    conditions.push(
      `(name match $q || partNumber match $q || brand->name match $q || description match $q)`
    );
  }

  const where = conditions.length ? ` && ${conditions.join(' && ')}` : '';

  let order = '';
  if (sort === 'newest') order = '| order(createdAt desc)';
  else if (sort === 'oldest') order = '| order(createdAt asc)';
  else if (sort === 'price-asc') order = '| order(price asc)';
  else if (sort === 'price-desc') order = '| order(price desc)';

  const query = `*[_type == 'product'${where}]${order} { ${PRODUCT_FIELDS} }`;

  const params = {
    category,
    brand,
    q: q ? `${q}*` : undefined,
  };

  const docs = await sanity.fetch(query, params);
  return docs.map(shapeProduct);
}

export async function getProductById(id) {
  const doc = await sanity.fetch(
    `*[_type == 'product' && _id == $id][0] { ${PRODUCT_FIELDS} }`,
    { id }
  );
  return doc ? shapeProduct(doc) : null;
}

export async function getFeatured(limit = 5) {
  const docs = await sanity.fetch(
    `*[_type == 'product' && isFeatured == true] | order(createdAt desc) [0...$limit] { ${PRODUCT_FIELDS} }`,
    { limit }
  );
  return docs.map(shapeProduct);
}

export async function getLatest(limit = 5) {
  const docs = await sanity.fetch(
    `*[_type == 'product'] | order(createdAt desc) [0...$limit] { ${PRODUCT_FIELDS} }`,
    { limit }
  );
  return docs.map(shapeProduct);
}

export async function getRelated(product, limit = 4) {
  const docs = await sanity.fetch(
    `*[_type == 'product' && _id != $id] { ${PRODUCT_FIELDS} }`,
    { id: product.id }
  );

  const pool = docs.map(shapeProduct);
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
  if (result.length < limit) addUnique(pool);

  return result;
}