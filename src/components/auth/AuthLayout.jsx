import { Link, Outlet } from 'react-router-dom';
import largeLogo from '../../assets/largeLogo.png';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-center">
          <Link to="/" className="flex items-center shrink-0">
            <img src={largeLogo} alt="CBGinfotech" className="h-8 w-auto" />
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <Outlet />
        </div>
      </main>

      <footer className="border-t border-gray-200 py-6 text-center text-xs text-gray-400">
        <div className="flex items-center justify-center gap-4">
          <Link to="/about/terms" className="hover:text-brand">
            Terms
          </Link>
          <Link to="/about/privacy" className="hover:text-brand">
            Privacy
          </Link>
        </div>
      </footer>
    </div>
  );
}