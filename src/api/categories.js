import { sanity } from './sanity';

export async function getCategories() {
  return sanity.fetch(
    `*[_type == 'category'] | order(name asc) { "slug": slug.current, name }`
  );
}