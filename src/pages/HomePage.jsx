import { getFeatured, getLatest } from '../api/products';
import { useAsync } from '../hooks/useAsync';
import { usePageTitle } from '../hooks/usePageTitle';
import ProductSection from '../components/catalog/ProductSection';
import BrandsSection from '../components/home/BrandsSection';
import HeroCarousel from '../components/home/HeroCarousel';

export default function HomePage() {
  usePageTitle();

  const { data: featured, loading: featuredLoading } = useAsync(getFeatured);
  const { data: latest, loading: latestLoading } = useAsync(getLatest);

  return (
    <div>
      <HeroCarousel />

      <ProductSection
        title="Featured"
        products={featured}
        loading={featuredLoading}
        viewAllTo="/products"
      />

      <ProductSection
        title="New Arrivals"
        products={latest}
        loading={latestLoading}
        viewAllTo="/products?sort=newest"
      />

      <BrandsSection />
    </div>
  );
}