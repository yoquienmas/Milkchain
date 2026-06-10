import { useAuth } from "../context/ContextoAutenticacion.jsx";
import BarraNavegacionCliente from "./BarraNavegacionCliente.jsx";
import BarraNavegacionAdmin from "./BarraNavegacionAdmin.jsx";

export default function Navbar() {
  const { user, isAuthenticated } = useAuth();

  // Si no está logueado, mostramos la del cliente (o podrías crear una de invitado)
  if (!isAuthenticated) return <BarraNavegacionCliente />;

  // Asumiendo que el ID de rol 1 es Administrador
  return user?.id_rol === 1 || user?.idRol === 1 ? (
    <BarraNavegacionAdmin />
  ) : (
    <BarraNavegacionCliente />
  );
}