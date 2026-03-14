import { Navigate, Outlet } from 'react-router-dom';
import { useStore, type Role } from '../store/useStore';

interface ProtectedRouteProps {
  allowedRoles: Role[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { currentUser } = useStore();

  if (!currentUser) {
    // Not logged in, redirect to login
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(currentUser.role)) {
    // Logged in but doesn't have the right role
    // Redirect based on what role they do have
    if (currentUser.role === 'SECURITY') {
      return <Navigate to="/security" replace />;
    } else if (currentUser.role === 'RESIDENT') {
      return <Navigate to="/resident" replace />;
    } else {
      return <Navigate to="/dashboard" replace />; // fallback to admin dashboard
    }
  }

  // Access granted
  return <Outlet />;
};
