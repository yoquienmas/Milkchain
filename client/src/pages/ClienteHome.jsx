import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/ContextoAutenticacion.jsx";
import { useToast } from "../context/ContextoToast.jsx";
import { useCart } from "../context/ContextoCarrito.jsx";
import axios from "axios";
import ProductCard from "../components/TarjetaProducto.jsx";
import { FiPackage, FiBookOpen, FiTruck, FiRotateCcw, FiMessageCircle, FiArrowRight, FiArrowLeft, FiAward, FiShield, FiHeart, FiGlobe, FiShoppingCart } from "react-icons/fi";
import "../App.css";

function ClienteHome() {
  const { user } = useAuth();
  const { mostrarToast } = useToast();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [indiceActual, setIndiceActual] = useState(0);

  const totalItems = cart.reduce((acc, item) => acc + (parseInt(item.cantidad) || 0), 0);

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/productos");
        setProductos(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error al cargar productos para el carrusel:", err);
      }
    };
    cargarProductos();
  }, []);

  useEffect(() => {
    if (productos.length === 0) return;
    const interval = setInterval(() => {
      setIndiceActual((prev) => {
        let visible = 3;
        if (window.innerWidth <= 600) visible = 1;
        else if (window.innerWidth <= 992) visible = 2;
        const maxIndex = Math.max(0, productos.length - visible);
        if (prev >= maxIndex) {
          return 0;
        }
        return prev + 1;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [productos]);

  const irAnterior = () => {
    let visible = 3;
    if (window.innerWidth <= 600) visible = 1;
    else if (window.innerWidth <= 992) visible = 2;
    const maxIndex = Math.max(0, productos.length - visible);
    setIndiceActual((prev) => (prev === 0 ? maxIndex : prev - 1));
  };

  const irSiguiente = () => {
    let visible = 3;
    if (window.innerWidth <= 600) visible = 1;
    else if (window.innerWidth <= 992) visible = 2;
    const maxIndex = Math.max(0, productos.length - visible);
    setIndiceActual((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

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
      {/* Hero Banner de Bienvenida con Imagen Temática */}
      <div className="home-hero-split" style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "30px",
        backgroundColor: "var(--bg-white)",
        padding: "40px",
        borderRadius: "var(--radius-md)",
        boxShadow: "var(--shadow-sm)",
        border: "1px solid var(--border-color)",
        marginBottom: "40px",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Patrón decorativo de fondo */}
        <div style={{
          position: "absolute",
          top: 0, right: 0,
          width: "150px", height: "100%",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cpath d='M80,30 C90,20 95,35 90,45 C85,55 75,45 80,30 Z' fill='%2320140F' fill-opacity='0.01'/%3E%3Cpath d='M50,75 C60,68 68,85 58,92 C48,99 40,85 50,75 Z' fill='%2320140F' fill-opacity='0.01'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right center",
          pointerEvents: "none"
        }} />

        <div style={{ flex: "1 1 450px", zIndex: 2 }}>
          <h1 style={{ fontFamily: "var(--font-serif)", marginBottom: "15px", fontSize: "2.4rem", color: "var(--text-dark)" }}>
            ¡Hola, {user?.nombre || "Cliente"}!
          </h1>
          <p style={{ lineHeight: "1.7", fontSize: "1.1rem", color: "var(--text-muted)", margin: 0 }}>
            Conectamos a productores locales de <strong style={{ color: "var(--color-caramel)" }}>Corrientes</strong> con PyMEs del Litoral, garantizando la distribución eficiente de lácteos y alimentos perecederos en tiempo y forma, sin mínimos de compra desmedidos.
          </p>
        </div>
        
        <div style={{
          flex: "1 1 280px",
          maxWidth: "320px",
          height: "190px",
          borderRadius: "var(--radius-md)",
          overflow: "hidden",
          border: "2px solid var(--border-color)",
          boxShadow: "var(--shadow-md)",
          zIndex: 2
        }}>
          <img 
            src="/images/milk_farm_banner.png" 
            alt="Distribución de Lácteos MilkChain" 
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      </div>

      {/* Carrusel de Productos Destacados */}
      {productos.length > 0 && (
        <div style={{ marginBottom: "50px", position: "relative" }}>
          <h2 style={{ 
            fontFamily: "var(--font-serif)", 
            fontSize: "1.6rem", 
            marginBottom: "20px", 
            color: "var(--text-dark)", 
            borderBottom: "2px solid var(--border-color)", 
            paddingBottom: "10px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <span>Productos Destacados</span>
            <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "normal" }}>
              Nuestra selección recomendada
            </span>
          </h2>
          
          {/* Botones de navegación manual */}
          <button 
            onClick={irAnterior}
            style={{
              position: "absolute",
              left: "-15px",
              top: "calc(50% + 15px)",
              transform: "translateY(-50%)",
              background: "var(--bg-white)",
              border: "1.5px solid var(--border-color)",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              zIndex: 10,
              boxShadow: "var(--shadow-md)",
              color: "var(--text-dark)",
              transition: "all 0.2s ease"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "var(--color-caramel-light)";
              e.currentTarget.style.color = "var(--color-caramel)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "var(--bg-white)";
              e.currentTarget.style.color = "var(--text-dark)";
            }}
          >
            <FiArrowLeft />
          </button>
          
          <button 
            onClick={irSiguiente}
            style={{
              position: "absolute",
              right: "-15px",
              top: "calc(50% + 15px)",
              transform: "translateY(-50%)",
              background: "var(--bg-white)",
              border: "1.5px solid var(--border-color)",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              zIndex: 10,
              boxShadow: "var(--shadow-md)",
              color: "var(--text-dark)",
              transition: "all 0.2s ease"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "var(--color-caramel-light)";
              e.currentTarget.style.color = "var(--color-caramel)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "var(--bg-white)";
              e.currentTarget.style.color = "var(--text-dark)";
            }}
          >
            <FiArrowRight />
          </button>

          <div className="carousel-wrapper">
            <div 
              className="carousel-track"
              style={{
                transform: `translate3d(calc(-1 * ${indiceActual} * (100% / var(--slides-visible))), 0, 0)`
              }}
            >
              {productos.map((prod) => (
                <div key={prod.id_producto} className="carousel-slide">
                  <ProductCard producto={prod} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "1.6rem", marginBottom: "25px", color: "var(--text-dark)", borderBottom: "2px solid var(--border-color)", paddingBottom: "10px" }}>
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
      </div>

      {/* Botón flotante Confirmar y Comprar */}
      {cart.length > 0 && (
        <button 
          onClick={() => navigate("/cart")}
          className="btn-green floating-cart-btn"
          style={{ 
            position: "fixed",
            bottom: "35px",
            right: "40px",
            zIndex: 9999,
            padding: "15px 35px",
            borderRadius: "50px",
            fontSize: "1.02rem",
            boxShadow: "0 8px 30px rgba(176, 101, 47, 0.45)",
            display: "inline-flex",
            alignItems: "center",
            gap: "10px",
            border: "2px solid var(--bg-white)",
            fontWeight: "bold"
          }}
        >
          <FiShoppingCart style={{ fontSize: "1.25rem" }} /> 
          Confirmar y Comprar ({totalItems})
        </button>
      )}
    </div>
  );
}

export default ClienteHome;
