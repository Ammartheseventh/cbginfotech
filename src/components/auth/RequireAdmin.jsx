import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

export default function RequireAdmin({ children }) {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);

  if (loading) {
    return (
      <div className="py-24 text-center text-sm text-gray-500">Loading…</div>
    );
  }

  // Not logged in → send to login. No "from" here because the admin
  // panel isn't something you return to after logging in unless you're
  // already an admin.
  if (!user) return <Navigate to="/login" replace />;

  // Logged in but not an admin → send home.
  if (user.role !== 'admin') return <Navigate to="/" replace />;

  return children;
}