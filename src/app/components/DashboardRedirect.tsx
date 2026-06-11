import { Navigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

export function DashboardRedirect() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case 'admin':
      return <Navigate to="/admin" replace />;
    case 'librarian':
      return <Navigate to="/librarian" replace />;
    case 'reader':
    default:
      return <Navigate to="/reader" replace />;
  }
}
