import { Outlet, Link } from 'react-router-dom';
import smallLogo from '../../assets/smallLogo.png';
import mediumLogo from '../../assets/mediumLogo.png';
import largeLogo from '../../assets/largeLogo.png';

export default function AdminLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center shrink-0">
              <img
                src={smallLogo}
                alt="CBGinfotech"
                className="block h-7 w-auto xs:hidden"
              />
              <img
                src={mediumLogo}
                alt="CBGinfotech"
                className="hidden h-7 w-auto xs:block md:hidden"
              />
              <img
                src={largeLogo}
                alt="CBGinfotech"
                className="hidden h-8 w-auto md:block"
              />
            </Link>
            <span className="text-xs uppercase tracking-wide text-gray-400">
              Admin
            </span>
          </div>

          <Link
            to="/"
            className="text-sm text-gray-500 hover:text-brand transition-colors"
          >
            Back to store
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}