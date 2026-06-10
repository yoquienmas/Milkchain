import { Link } from "react-router-dom";
import { useAuth } from "../context/ContextoAutenticacion.jsx";
import { useToast } from "../context/ContextoToast.jsx";
import { FiPackage, FiTruck, FiRotateCcw, FiMessageCircle, FiArrowRight, FiAward, FiShield, FiHeart, FiGlobe } from "react-icons/fi";
import "../App.css";

function AdminHome() {
  const { user } = useAuth();
  const { mostrarToast } = useToast();

  const manejarEnviosClick = () => {
    mostrarToast("🚚 Tu envío se encuentra en preparación por nuestro equipo de logística del Litoral.", "info");
  };

  const manejarDevolucionClick = () => {
    mostrarToast("🔄 Para procesar un reclamo de mercadería, escríbenos a: devoluciones@milkchain.com.ar", "info");
  };

  const manejarVendedorClick = () => {
    mostrarToast("💬 ¡Hola! Un asesor de ventas regional se contactará contigo telefónicamente dentro de las próximas 2 horas.", "info");
  };

  return (
    <div className="home-container">
      {/* Hero Banner de Bienvenida */}
      <div className="home-hero">
        <h1 style={{ fontFamily: "var(--font-serif)" }}>
          ¡Hola, {user?.nombre || "Admin"}!
        </h1>
        <p style={{ maxWidth: "800px", margin: "0 auto", lineHeight: "1.6" }}>
          Panel administrativo para gestionar pedidos y visualizar estadísticas.
        </p>
      </div>

      <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.6rem", marginBottom: "25px", color: "var(--text-dark)", borderBottom: "2px solid var(--border-color)", paddingBottom: "10px" }}>
        Panel de Control Admin
      </h2>

      {/* Grilla de Tarjetas de Acción */}
      <div className="action-cards-grid">
        {/* Tarjeta 1: Mis Pedidos (Enlace) */}
        <Link to="/mis-pedidos" className="action-card card-orders">
          <div className="action-card-icon">
            <FiPackage />
          </div>
          <h3 style={{ fontFamily: "var(--font-serif)" }}>Ver Pedidos</h3>
          <p>
            Revisa el estado de los pedidos, historial y la información de envío.
          </p>
          <span className="action-card-arrow">
            Ver mis compras <FiArrowRight />
          </span>
        </Link>

        {/* Tarjeta 2: Monitorear Envíos */}
        <div onClick={manejarEnviosClick} className="action-card card-shipping" style={{ cursor: "pointer" }}>
          <div className="action-card-icon">
            <FiTruck />
          </div>
          <h3 style={{ fontFamily: "var(--font-serif)" }}>Monitorear Envíos</h3>
          <p>
            Sigue el trayecto del transporte para verificar la entrega.
          </p>
          <span className="action-card-arrow">
            Verificar estado <FiArrowRight />
          </span>
        </div>

        {/* Tarjeta 3: Devolver Pedido */}
        <div onClick={manejarDevolucionClick} className="action-card card-refund" style={{ cursor: "pointer" }}>
          <div className="action-card-icon">
            <FiRotateCcw />
          </div>
          <h3 style={{ fontFamily: "var(--font-serif)" }}>Devolver Pedido</h3>
          <p>
            Inicia un reclamo de devolución de forma ágil.
          </p>
          <span className="action-card-arrow">
            Iniciar reclamo <FiArrowRight />
          </span>
        </div>

        {/* Tarjeta 4: Soporte de Ventas */}
        <div onClick={manejarVendedorClick} className="action-card card-support" style={{ cursor: "pointer" }}>
          <div className="action-card-icon">
            <FiMessageCircle />
          </div>
          <h3 style={{ fontFamily: "var(--font-serif)" }}>Soporte de Ventas</h3>
          <p>
            Contacta a tu asesor regional para consultas y coordinación.
          </p>
          <span className="action-card-arrow">
            Contactar ahora <FiArrowRight />
          </span>
        </div>
      </div>
    </div>
  );
}

export default AdminHome;
