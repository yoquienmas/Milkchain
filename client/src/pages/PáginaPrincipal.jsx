import { Link } from "react-router-dom";
<<<<<<< HEAD

function PáginaPrincipal() {
  return (
    <div className="home-container">
      <div className="title-banner" style={{background: '#ddd', padding: '20px', textAlign: 'center', margin: '20px 0'}}>
        <h1>Inicio Cliente</h1>
      </div>

      <div className="home-menu-grid">
        <Link to="/mis-pedidos" className="btn-green" style={{textDecoration: 'none', display: 'inline-block', lineHeight: 'normal'}}>
           Ver pedidos
        </Link>
        <button className="btn-green">Ver envíos</button>
        <button className="btn-green">Devolver pedido</button>
        <button className="btn-green">Contactarse con vendedor</button>
        <Link to="/ver_catalogo" className="btn-green" style={{textDecoration: 'none', display: 'inline-block', lineHeight: 'normal'}}>
            Catálogo
        </Link>
=======
import { useAuth } from "../context/ContextoAutenticacion.jsx";
import { useToast } from "../context/ContextoToast.jsx";
import { 
  FiPackage, FiBookOpen, FiTruck, FiRotateCcw, FiMessageCircle, FiArrowRight,
  FiAward, FiShield, FiHeart, FiGlobe
} from "react-icons/fi";
import "../App.css";

function PáginaPrincipal() {
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
          ¡Hola, {user?.nombre || "Cliente"}!
        </h1>
        <p style={{ maxWidth: "800px", margin: "0 auto", lineHeight: "1.6" }}>
          Conectamos a productores locales de **Corrientes** con PyMEs del Litoral, garantizando la distribución eficiente de lácteos y alimentos perecederos en tiempo y forma, sin mínimos de compra desmedidos.
        </p>
      </div>

      <h2 style={{ 
        fontFamily: "var(--font-serif)", 
        fontSize: "1.6rem", 
        marginBottom: "25px",
        color: "var(--text-dark)",
        borderBottom: "2px solid var(--border-color)",
        paddingBottom: "10px"
      }}>
        Panel de Control
      </h2>

      {/* Grilla de Tarjetas de Acción Estilizadas */}
      <div className="action-cards-grid">
        {/* Tarjeta 1: Catálogo (Enlace) */}
        <Link to="/ver_catalogo" className="action-card card-catalog">
          <div className="action-card-icon">
            <FiBookOpen />
          </div>
          <h3 style={{ fontFamily: "var(--font-serif)" }}>Ver Catálogo</h3>
          <p>
            Explora nuestra selecta gama de lácteos y fiambres perecederos de origen correntino, ideales para PyMEs y comercios locales sin mínimos excesivos.
          </p>
          <span className="action-card-arrow">
            Ir al catálogo <FiArrowRight />
          </span>
        </Link>

        {/* Tarjeta 2: Mis Pedidos (Enlace) */}
        <Link to="/mis-pedidos" className="action-card card-orders">
          <div className="action-card-icon">
            <FiPackage />
          </div>
          <h3 style={{ fontFamily: "var(--font-serif)" }}>Ver Pedidos</h3>
          <p>
            Revisa el estado de tus compras anteriores, historial de pedidos y comprueba de forma transparente la información de tu envío.
          </p>
          <span className="action-card-arrow">
            Ver mis compras <FiArrowRight />
          </span>
        </Link>

        {/* Tarjeta 3: Ver Envíos (Acción Interactiva) */}
        <div onClick={manejarEnviosClick} className="action-card card-shipping" style={{ cursor: "pointer" }}>
          <div className="action-card-icon">
            <FiTruck />
          </div>
          <h3 style={{ fontFamily: "var(--font-serif)" }}>Monitorear Envíos</h3>
          <p>
            Sigue el trayecto de nuestro transporte para verificar que tu mercadería perecedera llegue a su destino en tiempo y forma.
          </p>
          <span className="action-card-arrow">
            Verificar estado <FiArrowRight />
          </span>
        </div>

        {/* Tarjeta 4: Devolver Pedido (Acción Interactiva) */}
        <div onClick={manejarDevolucionClick} className="action-card card-refund" style={{ cursor: "pointer" }}>
          <div className="action-card-icon">
            <FiRotateCcw />
          </div>
          <h3 style={{ fontFamily: "var(--font-serif)" }}>Devolver Pedido</h3>
          <p>
            Política transparente de devoluciones. Si tienes inconvenientes con mercadería perecedera, inicia tu reclamo de forma ágil.
          </p>
          <span className="action-card-arrow">
            Iniciar reclamo <FiArrowRight />
          </span>
        </div>

        {/* Tarjeta 5: Contactar Vendedor (Acción Interactiva) */}
        <div onClick={manejarVendedorClick} className="action-card card-support" style={{ cursor: "pointer" }}>
          <div className="action-card-icon">
            <FiMessageCircle />
          </div>
          <h3 style={{ fontFamily: "var(--font-serif)" }}>Soporte de Ventas</h3>
          <p>
            Ponte en contacto directo con tu asesor regional asignado para coordinar la preventa, logística o resolver tus consultas.
          </p>
          <span className="action-card-arrow">
            Contactar ahora <FiArrowRight />
          </span>
        </div>
      </div>

      {/* Sección Premium: Misión y Compromiso Litoral */}
      <div className="mission-section" style={{
        marginTop: "60px",
        backgroundColor: "var(--bg-white)",
        borderRadius: "var(--radius-md)",
        border: "1.5px solid var(--border-color)",
        padding: "45px",
        boxShadow: "var(--shadow-sm)"
      }}>
        <div style={{ textAlign: "center", marginBottom: "35px" }}>
          <span className="split-image-badge" style={{ marginBottom: "12px" }}>
            <FiAward style={{ marginRight: "4px", verticalAlign: "middle" }} /> 
            Compromiso Regional
          </span>
          <h2 style={{ 
            fontFamily: "var(--font-serif)", 
            fontSize: "2rem", 
            color: "var(--text-dark)",
            marginBottom: "10px"
          }}>
            Nuestra Misión y Alcance
          </h2>
          <p style={{ color: "var(--text-muted)", maxWidth: "700px", margin: "0 auto", fontSize: "0.98rem" }}>
            Buscamos potenciar la economía regional del Litoral y derribar las barreras de entrada impuestas por las grandes distribuidoras.
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "28px"
        }}>
          {/* Tarjeta de Misión 1 */}
          <div style={{
            padding: "25px",
            backgroundColor: "var(--bg-cream)",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border-color)",
            transition: "transform 0.2s ease"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <FiGlobe style={{ fontSize: "1.4rem", color: "var(--color-caramel)" }} />
              <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "1.15rem", margin: 0 }}>Conexión del Litoral</h4>
            </div>
            <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
              Facilitamos el vínculo comercial directo entre productores correntinos y comerciantes de **Formosa, Chaco, Santa Fe, Entre Ríos, Corrientes y Misiones**, coordinando preventa y logística eficiente.
            </p>
          </div>

          {/* Tarjeta de Misión 2 */}
          <div style={{
            padding: "25px",
            backgroundColor: "var(--bg-cream)",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border-color)",
            transition: "transform 0.2s ease"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <FiHeart style={{ fontSize: "1.4rem", color: "var(--color-caramel)" }} />
              <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "1.15rem", margin: 0 }}>Apoyo Real a PyMEs</h4>
            </div>
            <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
              Las PyMEs son el refugio de los consumidores. Combatimos las barreras de mínimos de compra excesivos que obligan a pequeños almacenes a desperdiciar mercadería perecedera que no llega a rotar.
            </p>
          </div>

          {/* Tarjeta de Misión 3 */}
          <div style={{
            padding: "25px",
            backgroundColor: "var(--bg-cream)",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border-color)",
            transition: "transform 0.2s ease"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <FiShield style={{ fontSize: "1.4rem", color: "var(--color-caramel)" }} />
              <h4 style={{ fontFamily: "var(--font-serif)", fontSize: "1.15rem", margin: 0 }}>Distribución Transparente</h4>
            </div>
            <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", lineHeight: "1.5" }}>
              Brindamos transparencia absoluta al permitir la personalización de fechas, puntos de entrega y dando la libertad al comerciante de elegir a su proveedor de transporte preferido de confianza.
            </p>
          </div>
        </div>
>>>>>>> Rama_Front
      </div>
    </div>
  );
}

export default PáginaPrincipal;
