import { useAuth } from "../context/ContextoAutenticacion.jsx";
import AdminHome from "./AdminHome.jsx";
import ClienteHome from "./ClienteHome.jsx";

function PaginaPrincipal() {
  const { user } = useAuth();

  if (!user) return null; // or loading spinner

  return (user?.id_rol === 1 || user?.idRol === 1) ? <AdminHome /> : <ClienteHome />;
}

export default PaginaPrincipal;