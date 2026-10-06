import { createClient } from '@sanity/client';

export const sanity = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET ?? 'production',
  apiVersion: '2024-10-01',
  useCdn: true,
});

// Convert a Sanity image object to a URL.
// Handles both uploaded assets (asset._ref) and external URLs (url).
export function imageUrl(image) {
  if (!image) return null;
  if (image.url) return image.url;

  const ref = image.asset?._ref;
  if (!ref) return null;

  const [, id, dimensions, format] = ref.split('-');
  return `https://cdn.sanity.io/images/${sanity.config().projectId}/${sanity.config().dataset}/${id}-${dimensions}.${format}`;
}