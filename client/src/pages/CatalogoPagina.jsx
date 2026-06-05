import { useState, useEffect } from "react";
import axios from "axios";
import ProductCard from "../components/TarjetaProducto.jsx";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/ContextoCarrito.jsx";
import { FiSearch, FiArrowLeft, FiShoppingCart } from "react-icons/fi";
import "../App.css";

function CatalogoPagina() {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();
  
  const { cart } = useCart();

  useEffect(() => {
    // MODIFICADO: Renombrado ver_catalogo por listarProductos
    const listarProductos = async () => {
      try {
        setCargando(true);
        const res = await axios.get("http://localhost:3000/api/productos");
        setProductos(res.data);
      } catch (error) {
        console.error("Error al cargar productos", error);
      } finally {
        setCargando(false);
      }
    };
    listarProductos();
  }, []);

  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  const totalItems = cart.reduce((acc, item) => acc + (parseInt(item.cantidad) || 0), 0);

  return (
    <div className="cow-pattern-bg" style={{ minHeight: "100vh", padding: "40px 6%" }}>
      
      {/* Cabecera del Catálogo */}
      <div style={{
        backgroundColor: "var(--bg-white)",
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-md)",
        padding: "35px",
        textAlign: "center",
        boxShadow: "var(--shadow-sm)",
        marginBottom: "35px"
      }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2.2rem", color: "var(--text-dark)", marginBottom: "10px" }}>
          Nuestra Selección Artesanal
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", maxWidth: "600px", margin: "0 auto" }}>
          Explora nuestra exquisita selección de leches frescas, quesos maduros y dulces tradicionales, 
          directamente desde productores locales de máxima calidad.
        </p>
      </div>

      {/* Caja de Búsqueda */}
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        marginBottom: "40px", 
        gap: "12px",
        maxWidth: "500px",
        margin: "0 auto 40px auto" 
      }}>
        <div style={{ position: "relative", flex: 1 }}>
          <FiSearch style={{
            position: "absolute",
            left: "14px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--text-muted)",
            fontSize: "1.1rem"
          }} />
          <input
            type="text"
            placeholder="Buscar productos por nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ 
              paddingLeft: "44px",
              width: "100%",
              borderRadius: "var(--radius-sm)"
            }}
          />
        </div>
      </div>

      {/* Grilla de Productos */}
      {cargando ? (
        <div className="product-grid">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="product-card skeleton-card">
              <div className="skeleton-img"></div>
              <div className="skeleton-title"></div>
              <div className="skeleton-desc"></div>
              <div className="skeleton-desc-short"></div>
              <div className="skeleton-price-row">
                <div className="skeleton-price"></div>
                <div className="skeleton-btn"></div>
              </div>
            </div>
          ))}
        </div>
      ) : productosFiltrados.length > 0 ? (
        <div className="product-grid">
          {productosFiltrados.map((prod) => (
            <ProductCard key={prod.id_producto} producto={prod} />
          ))}
        </div>
      ) : (
        <div style={{
          textAlign: "center",
          padding: "50px 20px",
          backgroundColor: "var(--bg-white)",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border-color)",
          color: "var(--text-muted)"
        }}>
          <p style={{ fontSize: "1.1rem" }}>No se encontraron productos que coincidan con tu búsqueda.</p>
        </div>
      )}

      {/* Navegación de Pie de Catálogo */}
      <footer style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        padding: "30px 0",
        marginTop: "40px",
        borderTop: "1px solid var(--border-color)",
        alignItems: "center"
      }}>
        <button 
          onClick={() => navigate("/home")}
          className="btn-logout"
          style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontWeight: "600" }}
        >
          <FiArrowLeft /> Volver al Inicio
        </button>
      </footer>

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
            borderRadius: "50px", // Píldora redondeada premium
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

export default CatalogoPagina;