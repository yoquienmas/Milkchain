import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/ContextoAutenticacion.jsx";

export const ProtectorRuta = () => {
  const { isAuthenticated } = useAuth();

  // Si no está autenticado, lo mandamos al login
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Si está autenticado, permite ver las páginas hijas
  return <Outlet />;
};

export const ProtectorCliente = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Si es administrador (id_rol === 1), no se le permite el acceso y se redirige a /home
  if (user?.id_rol === 1 || user?.idRol === 1) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
};