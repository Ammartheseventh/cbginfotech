import BrandAccordion from './BrandAccordion';
import { brands } from '../../data/brands';

export default function BrandsSection() {
  return (
    <section className="max-w-7xl mx-auto px-4">
      <h2 className="text-xl font-semibold tracking-tight">
        Shop by brand
      </h2>
      <BrandAccordion items={brands} defaultIndex={0} />
    </section>
  );
}