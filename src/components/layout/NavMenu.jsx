import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useAsync } from '../../hooks/useAsync';
import { getCategories } from '../../api/categories';

function MenuIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  );
}

export default function NavMenu() {
  const [open, setOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const containerRef = useRef(null);
  const location = useLocation();

  const { data: categories } = useAsync(getCategories);

  // Close on route change
  useEffect(() => {
    setOpen(false);
    setCategoriesOpen(false);
  }, [location.pathname, location.search]);

  // Outside click / Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setCategoriesOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        setCategoriesOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="relative md:hidden" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        className="w-9 h-9 flex items-center justify-center text-gray-700 hover:text-black transition-colors"
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>

      {open && (
        <div className="fixed left-0 right-0 top-16 bg-white border-t border-gray-100 shadow-sm z-40">
          <div className="w-full py-3">
            {/* Horizontal row of nav links — equal-width columns */}
            <nav className="flex items-center">
              <Link
                to="/"
                className="flex-1 flex justify-center text-sm font-semibold text-gray-500 hover:text-black hover:underline decoration-2 underline-offset-4 hover:decoration-brand transition-colors"
              >
                Home
              </Link>

              <button
                type="button"
                onClick={() => setCategoriesOpen((v) => !v)}
                aria-expanded={categoriesOpen}
                className="group flex-1 flex justify-center items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-black transition-colors"
              >
                Categories
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`transition-all duration-200 group-hover:scale-125 group-hover:text-brand ${
                    categoriesOpen ? 'rotate-180' : ''
                  }`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              <Link
                to="/products"
                className="flex-1 flex justify-center text-sm font-semibold text-gray-500 hover:text-black hover:underline decoration-2 underline-offset-4 hover:decoration-brand transition-colors"
              >
                Products
              </Link>

              <Link
                to="/about"
                className="flex-1 flex justify-center text-sm font-semibold text-gray-500 hover:text-black hover:underline decoration-2 underline-offset-4 hover:decoration-brand transition-colors"
              >
                About
              </Link>
            </nav>

            {/* Categories sublist — expands below the row when open */}
            {categoriesOpen && (
              <ul className="mt-3 flex flex-col border-t border-gray-100 pt-2 px-4">
                {(categories ?? []).map((c) => (
                  <li key={c.slug}>
                    <NavLink
                      to={`/products?category=${c.slug}`}
                      className="block py-2 text-sm text-gray-500 hover:text-brand transition-colors"
                    >
                      {c.name}
                    </NavLink>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}