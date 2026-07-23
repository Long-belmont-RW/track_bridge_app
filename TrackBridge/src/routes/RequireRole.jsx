import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


export default function RequireRole({ role, children }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  if (role && user.role !== role) {
    return <Navigate to="/403" replace />;
  }
  return children;
}
