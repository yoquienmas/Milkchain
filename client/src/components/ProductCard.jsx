import { useState } from "react";
// Importamos useCart desde el archivo central de contexto
import { useCart } from "../context/CartContext";

export default function ProductCard({ producto }) {
  const { cart, agregarProducto, eliminar_producto_carrito } = useCart();
  
  // Buscamos si este producto ya está en el carrito para inicializar el estado
  const productoEnCarrito = cart.find(item => item.id === producto.id);

  const [cantidad, setCantidad] = useState(productoEnCarrito ? productoEnCarrito.cantidad : "");
  const [agregado, setAgregado] = useState(!!productoEnCarrito);

  const handleAgregarClick = () => {
    if (cantidad === "" || cantidad <= 0) {
      alert("Por favor, rellena el campo con la cantidad del producto.");
      return;
    }
    if (parseInt(cantidad) > producto.stock) {
      alert("No hay suficiente stock");
      return;
    }

    agregarProducto({ ...producto, cantidad: parseInt(cantidad) });
    setAgregado(true);
  };

  const handleActualizar = () => {
    if (parseInt(cantidad) > producto.stock) {
        alert("No hay suficiente stock");
        return;
    }
    
    // Usamos la misma función de agregar (que en tu contexto maneja la actualización)
    agregarProducto({ ...producto, cantidad: parseInt(cantidad) });
    alert("Cantidad actualizada");
    // Nota: Evita usar window.location.reload(), React actualizará la vista solo.
  };

  const handleEliminar = () => {
    eliminar_producto_carrito(producto.id);
    setCantidad(""); 
    setAgregado(false); 
  };

  return (
    <div className="product-card" style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', textAlign: 'left', backgroundColor: '#f9f9f9', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <img src={producto.imagen} alt={producto.nombre} style={{ width: '100%', height: '180px', objectFit: 'contain', backgroundColor: '#fff', marginBottom: '10px' }} />
      
      <h3 style={{ margin: '5px 0', fontSize: '1.1rem', borderTop: '1px solid #eee', paddingTop: '10px' }}>{producto.nombre}</h3>
      <p style={{ fontSize: '0.9rem', color: '#666', margin: '10px 0', minHeight: '40px', lineHeight: '1.4' }}>
        {producto.descripcion || "Sin descripción disponible"}
      </p>
      <p style={{ fontSize: '0.8rem', color: '#999' }}>Stock disponible: {producto.stock}</p>
      <p style={{ fontWeight: 'bold', fontSize: '1.1rem', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>${producto.precio}</p>

      {!agregado ? (
        <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
          <input
            type="number"
            placeholder="Cant"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            style={{ width: '70px', padding: '5px' }}
          />
          <button onClick={handleAgregarClick} style={{ backgroundColor: '#81c784', color: 'white', border: 'none', padding: '8px 12px', cursor: 'pointer', borderRadius: '4px' }}>
            Agregar al carrito
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
            <input type="number" value={cantidad} onChange={(e) => setCantidad(e.target.value)} style={{ width: '70px', padding: '5px' }} />
            <button onClick={handleActualizar} style={{ backgroundColor: '#ffb74d', color: 'white', border: 'none', padding: '8px 12px', cursor: 'pointer', borderRadius: '4px', flex: 1 }}>
              Actualizar
            </button>
          </div>
          <button onClick={handleEliminar} style={{ backgroundColor: '#e57373', color: 'white', border: 'none', padding: '8px 12px', cursor: 'pointer', borderRadius: '4px' }}>
            Eliminar
          </button>
        </div>
      )}
    </div>
  );
}