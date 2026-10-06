import { useCallback } from 'react';
import { getProducts } from '../api/products';
import { getBrandNames } from '../api/brands';
import { useAsync } from '../hooks/useAsync';
import { useFilters } from '../hooks/useFilters';
import { usePageTitle } from '../hooks/usePageTitle';
import { getCategories } from '../api/categories';
import ProductCard from '../components/catalog/ProductCard';
import FilterBar from '../components/catalog/FilterBar';

export default function ProductsPage() {
  usePageTitle('Products');

  const { category, brand, q, sort, setFilter, clearFilters, hasFilters } =
    useFilters();

  const fetchProducts = useCallback(
    () => getProducts({ category, brand, q, sort }),
    [category, brand, q, sort]
  );
  const { data: filtered, loading, error } = useAsync(fetchProducts);
  const { data: categories } = useAsync(getCategories);
  const { data: brands } = useAsync(getBrandNames);

  const handleSearchChange = useCallback(
    (value) => setFilter('q', value),
    [setFilter]
  );

  if (loading || !filtered) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <p className="text-sm text-gray-500">Loading products…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <p className="text-sm text-red-500">
          Could not load products. Try refreshing the page.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">

      <h1 className="mb-6 text-2xl font-semibold tracking-tight">All Products</h1>

      <FilterBar
        categories={categories ?? []}
        brands={brands ?? []}
        category={category}
        brand={brand}
        q={q}
        onCategoryChange={(v) => setFilter('category', v)}
        onBrandChange={(v) => setFilter('brand', v)}
        onSearchChange={handleSearchChange}
        onClear={clearFilters}
        hasFilters={hasFilters}
      />

      <div className="flex items-center justify-between gap-4 mb-6">
        <p className="text-sm text-gray-500">
          Showing {filtered.length} products
        </p>
        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="text-sm text-gray-500">
            Sort by
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => setFilter('sort', e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-black bg-white"
          >
            <option value="">Default</option>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-sm text-gray-500">
            No products match your filters.
          </p>
          <button
            onClick={clearFilters}
            className="mt-4 text-sm underline hover:text-black"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}