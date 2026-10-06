import { sanity, imageUrl } from './sanity';

// Fetch all brands with their logos, ordered alphabetically.
export async function getBrands() {
  const docs = await sanity.fetch(
    `*[_type == 'brand'] | order(name asc) {
      _id,
      name,
      "slug": slug.current,
      logo,
      coloredLogo,
      showInAccordion
    }`
  );

  return docs.map((doc) => ({
    id: doc._id,
    name: doc.name,
    slug: doc.slug,
    logo: imageUrl(doc.logo),
    coloredLogo: imageUrl(doc.coloredLogo),
    showInAccordion: doc.showInAccordion ?? false,
    link: `/products?brand=${encodeURIComponent(doc.name)}`,
  }));
}

// Fetch only the brands that should appear in the homepage accordion.
export async function getAccordionBrands() {
  const all = await getBrands();
  return all.filter((b) => b.showInAccordion && b.logo && b.coloredLogo);
}

export async function getBrandNames() {
  const all = await getBrands();
  return all.map((b) => b.name);
}