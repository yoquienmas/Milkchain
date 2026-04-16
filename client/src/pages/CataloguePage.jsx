import { useState, useEffect } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard";
import { useNavigate } from "react-router-dom";

function CataloguePage() {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();

  // 1. Cargar productos desde tu backend
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/productos"); // Ajusta tu ruta
        setProductos(res.data);
      } catch (error) {
        console.error("Error al cargar productos", error);
      }
    };
    fetchProductos();
  }, []);

  // 2. Lógica de búsqueda filtrada
  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="catalogue-container" style={{ backgroundColor: "#fff", minHeight: "100vh" }}>
      
      {/* Cabecera Gris - Agregar/Buscar */}
      <header style={{ backgroundColor: "#ddd", padding: "20px", textAlign: "center" }}>
        <h1 style={{ margin: 0, fontSize: "1.8rem", color: "#333" }}>
          Agregar/buscar <br /> producto
        </h1>
      </header>

      {/* Barra de Búsqueda */}
      <div style={{ display: "flex", justifyContent: "center", padding: "20px", gap: "10px" }}>
        <input
          type="text"
          placeholder="Buscar producto"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{
            padding: "10px",
            width: "300px",
            border: "1px solid #ccc",
            borderRadius: "4px"
          }}
        />
        <button className="btn-green" style={{ padding: "10px 20px" }}>
          Buscar
        </button>
      </div>

      {/* Grilla de Productos */}
      <div 
        className="product-grid" 
        style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 350px))", 
          gap: "30px", 
          padding: "20px",
          justifyContent: "center"
        }}
      >
        {productosFiltrados.map((prod) => (
          <ProductCard key={prod.id} producto={prod} />
        ))}
      </div>

      {/* Botones de Navegación Inferiores */}
      <footer style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        padding: "40px 20px",
        marginTop: "20px" 
      }}>
        <button 
          onClick={() => navigate("/home")}
          style={{ 
            backgroundColor: "#81c784", 
            color: "white", 
            border: "none", 
            padding: "10px 20px", 
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Volver al inicio
        </button>
        
        <button 
          onClick={() => navigate("/cart")}
          style={{ 
            backgroundColor: "#81c784", 
            color: "white", 
            border: "none", 
            padding: "10px 20px", 
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          Comprar
        </button>
      </footer>
    </div>
  );
}

export default CataloguePage;