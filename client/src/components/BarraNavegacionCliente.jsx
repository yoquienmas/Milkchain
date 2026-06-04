import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/ContextoAutenticacion.jsx";
import { useCart } from "../context/ContextoCarrito.jsx";
import { FiHome, FiBookOpen, FiPackage, FiShoppingCart, FiUser, FiLogOut, FiLogIn, FiUserPlus, FiSun, FiMoon } from "react-icons/fi";

export default function BarraNavegacion() {
  const { isAuthenticated, logout, user } = useAuth();
  const { cart } = useCart();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('milkchain_theme') === 'dark';
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('milkchain_theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('milkchain_theme', 'light');
    }
  }, [darkMode]);

  const totalItems = cart.reduce((acc, item) => acc + (parseInt(item.cantidad) || 0), 0);

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to={isAuthenticated ? "/home" : "/login"} className="logo-container" onClick={() => setMenuAbierto(false)}>
          <img 
            src="/images/logo_MILKCHAIN.png" 
            alt="MilkChain Logo" 
            className="navbar-brand-img logo-themed"
          />
        </Link>
      </div>

      {/* Botón hamburguesa para móviles */}
      <button 
        className="navbar-toggle" 
        onClick={() => setMenuAbierto(!menuAbierto)}
        aria-label="Menú de navegación"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: "1.6rem",
          color: "var(--color-caramel)",
          padding: "6px"
        }}
      >
        {menuAbierto ? <FiX /> : <FiMenu />}
      </button>
      
      <ul className={`navbar-links ${menuAbierto ? "open" : ""}`} onClick={() => setMenuAbierto(false)}>
        {isAuthenticated ? (
          <>
            <li>
              <NavLink 
                to="/home" 
                className={({ isActive }) => isActive ? "active-link" : ""}
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <FiHome /> <span>Inicio</span>
              </NavLink>
            </li>
            {/* Catálogo accesible solo por clientes */}
            {(user?.id_rol !== 1 && user?.idRol !== 1) && (
              <li>
                <NavLink 
                  to="/ver_catalogo"
                  className={({ isActive }) => isActive ? "active-link" : ""}
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <FiBookOpen /> <span>Catálogo</span>
                </NavLink>
              </li>
            )}
            <li>
              <NavLink 
                to="/mis-pedidos"
                className={({ isActive }) => isActive ? "active-link" : ""}
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <FiPackage /> <span>Pedidos</span>
              </NavLink>
            </li>
            {/* Carrito accesible solo por clientes */}
            {(user?.id_rol !== 1 && user?.idRol !== 1) && (
              <li>
                <NavLink 
                  to="/cart"
                  className={({ isActive }) => isActive ? "active-link" : ""}
                  style={{ display: "flex", alignItems: "center", gap: "6px", position: "relative" }}
                >
                  <FiShoppingCart /> 
                  <span>Carrito</span>
                  {totalItems > 0 && (
                    <span style={{
                      position: "absolute",
                      top: "-8px",
                      right: "-12px",
                      backgroundColor: "var(--color-caramel)",
                      color: "white",
                      fontSize: "0.7rem",
                      fontWeight: "bold",
                      borderRadius: "50%",
                      width: "18px",
                      height: "18px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
                    }}>
                      {totalItems}
                    </span>
                  )}
                </NavLink>
              </li>
            )}
            <li className="navbar-user-info" style={{ marginLeft: "15px" }}>
              <FiUser style={{ color: "var(--color-caramel)", fontSize: "1.1rem" }} />
              <span style={{ fontWeight: 600 }}>{user?.nombre || "Usuario"}</span>
            </li>
            <li>
              <button onClick={logout} className="btn-logout">
                <FiLogOut /> <span>Salir</span>
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <FiLogIn /> <span>Iniciar sesión</span>
              </Link>
            </li>
            <li>
              <Link to="/register" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <FiUserPlus /> <span>Registro</span>
              </Link>
            </li>
          </>
        )}
        
        {/* Botón de Modo Noche / Día */}
        <li style={{ marginLeft: "10px", borderLeft: "1px solid var(--border-color)", paddingLeft: "15px", display: "flex", alignItems: "center" }}>
          <button 
            onClick={() => setDarkMode(!darkMode)} 
            style={{ 
              background: "none", 
              border: "none", 
              cursor: "pointer", 
              fontSize: "1.3rem", 
              color: "var(--color-caramel)",
              display: "flex",
              alignItems: "center",
              padding: "6px"
            }}
            title={darkMode ? "Activar Modo Día" : "Activar Modo Noche"}
          >
            {darkMode ? <FiSun /> : <FiMoon />}
          </button>
        </li>
      </ul>
    </nav>
  );
}