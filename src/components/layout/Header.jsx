import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useAsync } from '../../hooks/useAsync';
import { getCategories } from '../../api/categories';
import NavMenu from './NavMenu';
import largeLogo from '../../assets/largeLogo.png';
import mediumLogo from '../../assets/mediumLogo.png';
import smallLogo from '../../assets/smallLogo.png';
import Search from './Search';

function CartIcon() {
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
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function AccountIcon() {
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
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export default function Header() {
  const itemCount = useCartStore((state) =>
    state.items.reduce((sum, i) => sum + i.quantity, 0)
  );

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const { data: categories } = useAsync(getCategories);

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const userMenuRef = useRef(null);
  const categoriesRef = useRef(null);

  // Close user menu on outside click / Escape
  useEffect(() => {
    if (!userMenuOpen) return;
    const onDown = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [userMenuOpen]);

  // Close categories menu on outside click / Escape
  useEffect(() => {
    if (!categoriesOpen) return;
    const onDown = (e) => {
      if (categoriesRef.current && !categoriesRef.current.contains(e.target)) {
        setCategoriesOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setCategoriesOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [categoriesOpen]);

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left group: logo + nav */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center shrink-0">
            {/* small*/}
            <img
              src={smallLogo}
              alt="CBGinfotech"
              className="block h-7 w-auto xs:hidden"
            />

            {/* medium*/}
            <img
              src={mediumLogo}
              alt="CBGinfotech"
              className="hidden h-7 w-auto xs:block md:hidden"
            />

            {/* large*/}
            <img
              src={largeLogo}
              alt="CBGinfotech"
              className="hidden h-8 w-auto md:block"
            />
          </Link>

          <NavMenu />

          <nav className="md:flex hidden items-center gap-6">
            <Link
              to="/"
              className="text-sm font-semibold text-gray-500 hover:text-black hover:underline decoration-2 underline-offset-4 hover:decoration-brand"
            >
              Home
            </Link>

            {/* Categories dropdown */}
            <div className="relative" ref={categoriesRef}>
              <button
                type="button"
                onClick={() => setCategoriesOpen((v) => !v)}
                aria-expanded={categoriesOpen}
                aria-haspopup="menu"
                className="group flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-black transition-colors"
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

              {categoriesOpen && (
                <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
                  <ul className="py-1 max-h-96 overflow-y-auto">
                    {(categories ?? []).map((c) => (
                      <li key={c.slug}>
                        <NavLink
                          to={`/products?category=${c.slug}`}
                          onClick={() => setCategoriesOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand transition-colors"
                        >
                          {c.name}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <Link
              to="/products"
              className="text-sm font-semibold text-gray-500 hover:text-black hover:underline decoration-2 underline-offset-4 hover:decoration-brand"
            >
              Products
            </Link>

            <Link
              to="/about"
              className="text-sm font-semibold text-gray-500 hover:text-black hover:underline decoration-2 underline-offset-4 hover:decoration-brand"
            >
              About
            </Link>
          </nav>
        </div>

        {/* Right group: search + cart + account */}
        <div className="flex items-center gap-4">
          <Search />

          {/* Cart */}
          <Link
            to="/cart"
            className="group relative flex items-center gap-2 mr-2 text-gray-700 hover:text-black transition-colors"
            aria-label="Cart"
          >
            {/* lg and up: "Cart" text */}
            <span className="hidden lg:inline text-sm font-medium">Cart</span>
            {/* md and below: icon */}
            <span className="inline lg:hidden">
              <CartIcon />
            </span>

            {itemCount > 0 && (
              <span className="absolute -top-1.25 -right-2.75 transition-transform duration-200 group-hover:scale-125">
                <span
                  key={itemCount}
                  className="bg-brand text-white text-xs rounded-full w-4 h-4 flex items-center justify-center animate-pulse-scale"
                >
                  {itemCount}
                </span>
              </span>
            )}
          </Link>

          {/* User menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setUserMenuOpen((v) => !v)}
              aria-label="Account menu"
              aria-expanded={userMenuOpen}
              className="group flex items-center gap-0.5 text-sm font-medium text-gray-700 hover:text-black transition-colors"
            >
              {/* lg and up: first name */}
              <span className="hidden lg:inline">
                {user?.name?.split(' ')[0] ?? 'Account'}
              </span>
              {/* md and below: icon */}
              <span className="inline lg:hidden">
                <AccountIcon />
              </span>

              {/* Chevron — hidden below lg alongside the name */}
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`hidden lg:block transition-transform duration-200 group-hover:scale-125 group-hover:text-brand ${
                  userMenuOpen ? 'rotate-180' : ''
                }`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50">
                {user ? (
                  <>
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>

                    <ul className="py-1">
                      {user.role === 'admin' && (
                        <li>
                          <Link
                            to="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="block px-4 py-2 text-sm font-medium text-brand hover:bg-gray-50 transition-colors"
                          >
                            Admin Panel
                          </Link>
                        </li>
                      )}
                      <li>
                        <Link
                          to="/account/orders"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand transition-colors"
                        >
                          My Orders
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/account/addresses"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand transition-colors"
                        >
                          Addresses
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/account/settings"
                          onClick={() => setUserMenuOpen(false)}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand transition-colors"
                        >
                          Settings
                        </Link>
                      </li>
                    </ul>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm font-semibold text-brand hover:bg-gray-50 transition-colors border-t border-gray-100"
                    >
                      Log Out
                    </button>
                  </>
                ) : (
                  <ul className="py-1">
                    <li>
                      <Link
                        to="/login"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
                      >
                        Log in
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/register"
                        onClick={() => setUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-brand transition-colors"
                      >
                        Register
                      </Link>
                    </li>
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}