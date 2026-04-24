import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ProtectedRoute = () => {
  const { isAuthenticated} = useAuth();

  // Si no está autenticado, lo mandamos al login
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Si está autenticado, permite ver las páginas hijas
  return <Outlet />;
};