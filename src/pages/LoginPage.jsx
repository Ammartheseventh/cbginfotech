import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { usePageTitle } from '../hooks/usePageTitle';

export default function LoginPage() {
  usePageTitle('Log in');

  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Where to go after login. If the user was redirected here from a
  // protected route, RequireAuth will have set state.from.
  const from = location.state?.from ?? '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setSubmitting(true);
    try {
      const user = await login(email, password);
      // Admins go to /admin, customers to wherever they were headed.
      navigate(user.role === 'admin' ? '/admin' : from, { replace: true });
    } catch {
      // Error already set in the store.
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-1">Log in</h1>
      <p className="text-sm text-gray-500 mb-8">
        Welcome back. Enter your details to continue.
      </p>

      {error && (
        <div className="mb-4 px-3 py-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-700">Email</label>
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-black"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-700">Password</label>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-black"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 py-2.5 bg-brand text-white text-sm font-medium rounded-md hover:bg-brand-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <p className="text-sm text-gray-500 mt-6 text-center">
        Don't have an account?{' '}
        <Link to="/register" className="text-gray-900 underline hover:text-brand transition-colors">
          Register
        </Link>
      </p>
    </div>
  );
}