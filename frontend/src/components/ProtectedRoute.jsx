import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRole }) => {
  const { user, token } = useContext(AuthContext);

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Diagram Flow: Check Account Status (ACTIVE)
  if (user.status !== 'ACTIVE') {
    alert('ACCESS DENIED: Account status is PENDING or DEACTIVATED');
    return <Navigate to="/login" replace />;
  }

  // Diagram Flow: Check Role
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;