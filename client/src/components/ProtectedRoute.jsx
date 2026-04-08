import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute — guards a route by token presence and optionally by role.
 * Props:
 *   children  — what to render if allowed
 *   roles     — optional array of roles that may access this route (e.g. ['Admin'])
 */
export default function ProtectedRoute({ children, roles }) {
  const token = localStorage.getItem('quicksign_token');
  if (!token) return <Navigate to="/signin" replace />;

  if (roles && roles.length > 0) {
    try {
      const user = JSON.parse(localStorage.getItem('quicksign_user') || '{}');
      if (!roles.includes(user.role)) return <Navigate to="/signin" replace />;
    } catch {
      return <Navigate to="/signin" replace />;
    }
  }

  return children;
}
