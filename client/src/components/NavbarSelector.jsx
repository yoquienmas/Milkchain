import { useAuth } from "../context/ContextoAutenticacion.jsx";
import BarraNavegacionCliente from "./BarraNavegacionCliente.jsx";
import BarraNavegacionAdmin from "./BarraNavegacionAdmin.jsx";

export default function NavbarSelector() {
  const { user, isAuthenticated } = useAuth();

  // Si no está autenticado, mostramos la barra de cliente (o podrías crear una de invitado)
  if (!isAuthenticated) return <BarraNavegacionCliente />;

  // Si es admin (rol 1), mostramos la barra de Admin
  return user?.id_rol === 1 || user?.idRol === 1 ? (
    <BarraNavegacionAdmin />
  ) : (
    <BarraNavegacionCliente />
  );
}