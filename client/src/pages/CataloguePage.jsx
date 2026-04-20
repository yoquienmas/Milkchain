import { useState, useEffect } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext"; // 1. Importamos el hook del carrito

function CataloguePage() {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();
  
  // 2. Extraemos el arreglo 'cart' del contexto
  const { cart } = useCart();

  // Acción: ver_catalogo()
  useEffect(() => {
    const ver_catalogo = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/productos");
        setProductos(res.data);
      } catch (error) {
        console.error("Error al cargar productos", error);
      }
    };
    ver_catalogo();
  }, []);

  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="catalogue-container" style={{ backgroundColor: "#fff", minHeight: "100vh" }}>
      
      <header style={{ backgroundColor: "#ddd", padding: "20px", textAlign: "center" }}>
        <h1 style={{ margin: 0, fontSize: "1.8rem", color: "#333" }}>
          Agregar/buscar <br /> producto
        </h1>
      </header>

      <div style={{ display: "flex", justifyContent: "center", padding: "20px", gap: "10px" }}>
        <input
          type="text"
          placeholder="Buscar producto"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ padding: "10px", width: "300px", border: "1px solid #ccc", borderRadius: "4px" }}
        />
        <button className="btn-green" style={{ padding: "10px 20px" }}>Buscar</button>
      </div>

      <div className="product-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 350px))", gap: "30px", padding: "20px", justifyContent: "center" }}>
        {productosFiltrados.map((prod) => (
          <ProductCard key={prod.id} producto={prod} />
        ))}
      </div>

      <footer style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        padding: "40px 20px",
        marginTop: "20px" 
      }}>
        <button 
          onClick={() => navigate("/home")}
          style={{ backgroundColor: "#81c784", color: "white", border: "none", padding: "10px 20px", borderRadius: "4px", cursor: "pointer" }}
        >
          Volver al inicio
        </button>
        
        {/* 3. LÓGICA CONDICIONAL: Solo muestra el botón si el carrito tiene productos */}
        {cart.length > 0 && (
          <button 
            onClick={() => navigate("/cart")}
            style={{ 
              backgroundColor: "#2e7d32", // Un verde un poco más oscuro para que resalte
              color: "white", 
              border: "none", 
              padding: "10px 30px", 
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
            }}
          >
            Comprar
          </button>
        )}
      </footer>
    </div>
  );
}

export default CataloguePage;