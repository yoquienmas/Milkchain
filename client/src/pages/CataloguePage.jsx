import { useState, useEffect } from "react";
import axios from "axios";
import { useCart } from "../context/CartContext"; // Hook correcto para el carrito

function CataloguePage() {
  const [products, setProducts] = useState([]);
  const { addToCart } = useCart(); // Extraemos la función del contexto del carrito

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Ajustado al puerto 3000 que muestra tu terminal
        const res = await axios.get("http://localhost:3000/api/products", {
          withCredentials: true,
        });
        setProducts(res.data);
      } catch (error) {
        console.error("Error al cargar productos:", error);
      }
    };
    fetchProducts();
  }, []);

  // Función para manejar la subida al carrito con la cantidad elegida
  const handleAddToCart = (product, quantity) => {
    addToCart({ ...product, quantity: parseInt(quantity) });
  };

  return (
    <div className="catalogue-container">
      <div className="search-bar" style={{ marginBottom: '20px' }}>
        <input type="text" placeholder="Buscar producto..." className="search-input" />
        <button className="btn-green">Buscar</button>
      </div>

      <div className="products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        {products.map((product) => (
          <div key={product.id} className="product-card" style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
            {/* Imagen del producto desde tu DB o URL externa */}
            <img 
              src={product.image || 'https://via.placeholder.com/150'} 
              alt={product.name} 
              style={{ width: '100%', height: '150px', objectFit: 'cover' }} 
            />
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <span className="price" style={{ fontWeight: 'bold', fontSize: '1.2em' }}>
              ${product.price}
            </span>

            <div className="card-actions" style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
              <input 
                type="number" 
                id={`qty-${product.id}`} 
                defaultValue={1} 
                min="1" 
                style={{ width: '50px' }} 
              />
              <button 
                onClick={() => {
                  const qty = document.getElementById(`qty-${product.id}`).value;
                  handleAddToCart(product, qty);
                }} 
                className="btn-green"
              >
                Agregar al carrito
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CataloguePage;