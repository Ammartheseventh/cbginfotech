import { useState } from 'react';

export default function FilterBar({
  categories,
  brands,
  category,
  brand,
  q,
  onCategoryChange,
  onBrandChange,
  onSearchChange,
  onClear,
  hasFilters,
}) {
  // Local state so typing doesn't touch the URL / trigger a fetch.
  const [localQuery, setLocalQuery] = useState(q);

  // When q changes externally (Header search, "Clear filters", browser back),
  // adjust local state during render. This is React's documented pattern for
  // "syncing with a prop" and avoids the setState-in-effect cascading-render
  // anti-pattern: https://react.dev/reference/react/useState#storing-information-from-previous-renders
  const [prevQ, setPrevQ] = useState(q);
  if (q !== prevQ) {
    setPrevQ(q);
    setLocalQuery(q);
  }

  const submitSearch = () => {
    onSearchChange(localQuery.trim());
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitSearch();
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
      <div className="relative flex-1">
        <input
          type="text"
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search name or part number…"
          className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-black"
        />
        <button
          type="button"
          onClick={submitSearch}
          aria-label="Search"
          className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-black transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
            />
          </svg>
        </button>
      </div>

      <select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-black bg-white"
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.name}
          </option>
        ))}
      </select>

      <select
        value={brand}
        onChange={(e) => onBrandChange(e.target.value)}
        className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-black bg-white"
      >
        <option value="">All brands</option>
        {brands.map((b) => (
          <option key={b} value={b}>
            {b}
          </option>
        ))}
      </select>

      {hasFilters && (
        <button
          onClick={onClear}
          className="px-3 py-2 text-sm text-gray-500 hover:text-black underline whitespace-nowrap"
        >
          Clear
        </button>
      )}
    </div>
  );
}