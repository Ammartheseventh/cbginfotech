import { Link } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle';

export default function NotFoundPage() {
  usePageTitle('Not found');

  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <p className="text-sm font-medium text-gray-500">404</p>
      <h1 className="text-3xl font-semibold tracking-tight mt-2">
        Page not found
      </h1>
      <p className="text-sm text-gray-500 mt-3">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="inline-block mt-8 px-6 py-3 bg-brand text-white text-sm font-medium rounded-md hover:bg-brand-dark transition-colors"
      >
        Back to home
      </Link>
    </div>
  );
}