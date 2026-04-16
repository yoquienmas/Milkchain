import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";

export default function ProductCard({ producto }) {
  const { cart, addToCart, removeFromCart } = useCart();
  
  const productoEnCarrito = cart.find(item => item.id === producto.id);

  const [cantidad, setCantidad] = useState(productoEnCarrito ? productoEnCarrito.cantidad : "");
  const [agregado, setAgregado] = useState(!!productoEnCarrito);

  const handleAgregar = () => {
    if (cantidad === "" || cantidad <= 0) {
      alert("Por favor, rellena el campo con la cantidad del producto.");
      return;
    }
    addToCart({ ...producto, cantidad: parseInt(cantidad) });
    setAgregado(true);
  };

  const handleActualizar = () => {
    if (cantidad > 0) {
      addToCart({ ...producto, cantidad: parseInt(cantidad) });
      alert("Cantidad actualizada");
      window.location.reload(); 
    }
  };

  const handleEliminar = () => {
    removeFromCart(producto.id);
    setCantidad(""); 
    setAgregado(false); 
  };

  return (
    <div className="product-card" style={{ 
      border: '1px solid #ccc', 
      padding: '15px', 
      borderRadius: '2px', // Bordes más rectos como en la imagen
      textAlign: 'left', // Alineación a la izquierda para los textos
      backgroundColor: '#f9f9f9',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <img 
        src={producto.imagen} 
        alt={producto.nombre} 
        style={{ width: '100%', height: '180px', objectFit: 'contain', backgroundColor: '#fff', marginBottom: '10px' }} 
      />
      
      <h3 style={{ margin: '5px 0', fontSize: '1.1rem', borderTop: '1px solid #eee', paddingTop: '10px' }}>
        {producto.nombre}
      </h3>
      
      {/* --- AQUÍ ESTÁ LA DESCRIPCIÓN --- */}
      <p style={{ 
        fontSize: '0.9rem', 
        color: '#666', 
        margin: '10px 0', 
        minHeight: '40px', // Para que todas las tarjetas mantengan el mismo tamaño
        lineHeight: '1.4'
      }}>
        {producto.descripcion || "Sin descripción disponible"}
      </p>
      
      <p style={{ 
        fontWeight: 'bold', 
        fontSize: '1.1rem', 
        borderBottom: '1px solid #eee', 
        paddingBottom: '10px',
        marginBottom: '15px' 
      }}>
        ${producto.precio}
      </p>

      {!agregado ? (
        <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
          <input
            type="number"
            placeholder="Cantidad"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            style={{ width: '70px', padding: '5px', border: '1px solid #ccc' }}
          />
          <button 
            onClick={handleAgregar} 
            className="btn-green"
            style={{ 
                backgroundColor: '#81c784', 
                color: 'white', 
                border: 'none', 
                padding: '8px 12px', 
                cursor: 'pointer',
                borderRadius: '4px'
            }}
          >
            Agregar al carrito
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
            <input
              type="number"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              style={{ width: '70px', padding: '5px', border: '1px solid #ccc' }}
            />
            <button 
              onClick={handleActualizar} 
              style={{ backgroundColor: '#ffb74d', color: 'white', border: 'none', padding: '8px 12px', cursor: 'pointer', borderRadius: '4px', flex: 1 }}
            >
              Actualizar
            </button>
          </div>
          <button 
            onClick={handleEliminar} 
            style={{ backgroundColor: '#e57373', color: 'white', border: 'none', padding: '8px 12px', cursor: 'pointer', borderRadius: '4px' }}
          >
            Eliminar
          </button>
        </div>
      )}
    </div>
  );
}