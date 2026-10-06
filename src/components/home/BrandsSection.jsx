import BrandAccordion from './BrandAccordion';
import { useAsync } from '../../hooks/useAsync';
import { getAccordionBrands } from '../../api/brands';

export default function BrandsSection() {
  const { data: brands, loading } = useAsync(getAccordionBrands);

  if (loading || !brands || brands.length === 0) {
    return null;
  }

  return (
    <section className="max-w-7xl mx-auto px-4">
      <h2 className="text-xl font-semibold tracking-tight">Shop by brand</h2>
      <BrandAccordion items={brands} defaultIndex={0} />
    </section>
  );
}