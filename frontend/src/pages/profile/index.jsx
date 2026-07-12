import { Navigate } from "react-router-dom";

// Profile fields are managed from Settings — see pages/settings/Settings.jsx.
export default function ProfileRedirect() {
  return <Navigate to="/settings" replace />;
}
