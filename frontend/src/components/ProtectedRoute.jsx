import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ROLE_PERMISSIONS } from "@/utils/constants";

export function ProtectedRoute({ children, section }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (section && !ROLE_PERMISSIONS[user.role]?.includes(section)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
