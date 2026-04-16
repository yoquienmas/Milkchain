import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";

export default function ProductCard({ producto }) {
  const { cart, addToCart, removeFromCart } = useCart();
  
  // Buscamos si este producto específico ya está en el carrito global
  const productoEnCarrito = cart.find(item => item.id === producto.id);

  // Inicializamos el estado basado en lo que hay en el carrito
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
      // Ya no necesitas reload() forzado porque el contexto es reactivo, 
      // pero si lo quieres dejar por estética, la cantidad se mantendrá.
      window.location.reload(); 
    }
  };

  const handleEliminar = () => {
    removeFromCart(producto.id);
    setCantidad(""); 
    setAgregado(false); 
  };

  return (
    <div className="product-card" style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
      <img src={producto.imagen} alt={producto.nombre} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
      <h3>{producto.nombre}</h3>
      <p>${producto.precio}</p>

      {!agregado ? (
        <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
          <input
            type="number"
            placeholder="Cantidad"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            style={{ width: '80px' }}
          />
          <button onClick={handleAgregar} className="btn-green">Agregar al carrito</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
            <input
              type="number"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              style={{ width: '80px' }}
            />
            <button onClick={handleActualizar} style={{ backgroundColor: '#ffb74d', color: 'white' }}>Actualizar</button>
          </div>
          <button onClick={handleEliminar} style={{ backgroundColor: '#e57373', color: 'white' }}>Eliminar</button>
        </div>
      )}
    </div>
  );
}