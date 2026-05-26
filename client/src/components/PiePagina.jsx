import { Link } from "react-router-dom";
import { useAuth } from "../context/ContextoAutenticacion.jsx";
import { FiInstagram, FiFacebook, FiMail, FiPhone, FiMapPin, FiTruck } from "react-icons/fi";

export default function PiePagina() {
  const { isAuthenticated } = useAuth();

  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-col">
          <h3 style={{ fontFamily: "var(--font-serif)" }}>MilkChain</h3>
          <p>
            Conectando a productores de Corrientes con PyMEs del Litoral. Garantizando la distribución eficiente de alimentos perecederos en tiempo y forma.
          </p>
          <div className="footer-social-icons">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FiInstagram />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <FiFacebook />
            </a>
          </div>
        </div>

        <div className="footer-col">
          <h3 style={{ fontFamily: "var(--font-serif)" }}>Navegación</h3>
          <ul>
            {isAuthenticated ? (
              <>
                <li><Link to="/home">Inicio</Link></li>
                <li><Link to="/ver_catalogo">Catálogo</Link></li>
                <li><Link to="/mis-pedidos">Mis Pedidos</Link></li>
                <li><Link to="/cart">Mi Carrito</Link></li>
              </>
            ) : (
              <>
                <li><Link to="/login">Iniciar Sesión</Link></li>
                <li><Link to="/register">Registrarse</Link></li>
              </>
            )}
          </ul>
        </div>

        <div className="footer-col">
          <h3 style={{ fontFamily: "var(--font-serif)" }}>Contacto</h3>
          <ul>
            <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <FiMail style={{ color: "var(--color-caramel)" }} />
              <a href="mailto:info@milkchain.com.ar">info@milkchain.com.ar</a>
            </li>
            <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <FiPhone style={{ color: "var(--color-caramel)" }} />
              <span>+54 (11) 5432-1098</span>
            </li>
            <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <FiMapPin style={{ color: "var(--color-caramel)" }} />
              <span>Corrientes, Argentina</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} MilkChain. Todos los derechos reservados. Clásico Sabor Argentino.</p>
      </div>
    </footer>
  );
}