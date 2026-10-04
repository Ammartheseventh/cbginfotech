import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

export default function RequireAuth({ children }) {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const location = useLocation();

  // While we're checking the session, don't redirect. show a placeholder.
  // Otherwise a logged-in user would see a flash of "redirect to login".
  if (loading) {
    return (
      <div className="py-24 text-center text-sm text-gray-500">Loading…</div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  return children;
}