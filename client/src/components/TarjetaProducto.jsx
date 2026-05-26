import { useState } from "react";
import { useCart } from "../context/ContextoCarrito.jsx";

export default function TarjetaProducto ({ producto }) {
  const nombreImagen = producto.nombre.toLowerCase().replace(/\s+/g, '-');
  const rutaPrueba = `/images/${nombreImagen}.jpg`;
  const { cart, agregarProducto, eliminar_producto_carrito } = useCart();
  const productoEnCarrito = cart.find(item => item.id_producto === producto.id_producto);

  const [cantidad, setCantidad] = useState(productoEnCarrito ? productoEnCarrito.cantidad : "");
  const [agregado, setAgregado] = useState(!!productoEnCarrito);

  // METODO NUEVO: Sincronizado exactamente con el Paso 2.1.1 de la conversación
  const validarStock = (cant) => {
    return parseInt(cant) <= producto.stock;
  };

 // Orquestador del evento del botón (Paso 2)
  const manejarAgregarClick = () => {
    if (cantidad === "" || cantidad <= 0) {
      alert("Por favor, rellena el campo con la cantidad del producto.");
      return;
    }

    // PASO 2.1.1: Invocación idéntica a la conversación UML
    if (validarStock(cantidad) === false) {
      // PASO 2.1.2: Mensaje alternativo
      alert("No hay suficiente stock");
      return;
    }

   // PASO 2.1: Añade el producto mutando el estado global
    agregarProducto({
      ...producto, 
      precio: parseFloat(producto.precio), 
      cantidad: parseInt(cantidad) 
    });
    setAgregado(true);
  };

  const manejarActualizar = () => {
    if (parseInt(cantidad) > producto.stock) {
        alert("No hay suficiente stock");
        return;
    }
    
agregarProducto({ 
  ...producto, 
  precio: parseFloat(producto.precio), // ¡IMPORTANTE!
  cantidad: parseInt(cantidad) 
});    alert("Cantidad actualizada");
    window.location.reload(); 
  };

  const manejarEliminar = () => {
    eliminar_producto_carrito(producto.id_producto);
    setCantidad(""); 
    setAgregado(false); 
  };

  return (
    <div className="product-card" style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '2px', textAlign: 'left', backgroundColor: '#f9f9f9', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
<img 
        src={producto.url_imagen || producto.ruta || rutaPrueba} 
        alt={producto.nombre} 
        style={{ width: '100%', height: '180px', objectFit: 'contain' }} />


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
          {/* CORRECCIÓN: Llamamos a la función local que valida el stock */}
          <button onClick={manejarAgregarClick} style={{ backgroundColor: '#81c784', color: 'white', border: 'none', padding: '8px 12px', cursor: 'pointer', borderRadius: '4px' }}>
            Agregar al carrito
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
            <input type="number" value={cantidad} onChange={(e) => setCantidad(e.target.value)} style={{ width: '70px', padding: '5px' }} />
            <button onClick={manejarActualizar} style={{ backgroundColor: '#ffb74d', color: 'white', border: 'none', padding: '8px 12px', cursor: 'pointer', borderRadius: '4px', flex: 1 }}>
              Actualizar
            </button>
          </div>
          <button onClick={manejarEliminar} style={{ backgroundColor: '#e57373', color: 'white', border: 'none', padding: '8px 12px', cursor: 'pointer', borderRadius: '4px' }}>
            Eliminar
          </button>
        </div>
      )}
    </div>
  );
}