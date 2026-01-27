import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, isLoading, isAdmin } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to auth if user is not logged in
  if (!user) {
    console.log(`[ProtectedRoute] No user found, redirecting from ${location.pathname} to /auth`);
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check for admin role requirement
  if (requireAdmin && !isAdmin) {
    console.warn(`[ProtectedRoute] Access denied: User ${user.email} (role: ${user.role}) attempted to access admin route ${location.pathname}`);
    return <Navigate to="/" replace />;
  }

  // Authorized: render the protected content
  return <>{children}</>;
}
