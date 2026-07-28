import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export function ProtectedRoute() {
  const { authenticated, ready } = useAuth();
  const location = useLocation();
  if (!ready) return <div className="page-loader"><span>Opening the album…</span></div>;
  return authenticated ? <Outlet /> : <Navigate to="/login" replace state={{ from: location.pathname }} />;
}
