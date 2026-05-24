import { useState } from "react";
import { useCart } from "../context/ContextoCarrito.jsx";
<<<<<<< HEAD

export default function TarjetaProducto ({ producto }) {
  const nombreImagen = producto.nombre.toLowerCase().replace(/\s+/g, '-');
  const rutaPrueba = `/images/${nombreImagen}.jpg`;
  const { cart, agregarProducto, eliminar_producto_carrito } = useCart();
  const productoEnCarrito = cart.find(item => item.id_producto === producto.id_producto);

  const [cantidad, setCantidad] = useState(productoEnCarrito ? productoEnCarrito.cantidad : "");
  const [agregado, setAgregado] = useState(!!productoEnCarrito);

  // Esta es la función que procesa la lógica antes de enviarla al carrito
  const manejarAgregarClick = () => {
    if (cantidad === "" || cantidad <= 0) {
      alert("Por favor, rellena el campo con la cantidad del producto.");
      return;
    }
    if (parseInt(cantidad) > producto.stock) {
      alert("No hay suficiente stock");
      return;
    }

   // En TarjetaProducto.jsx, al llamar al agregar:
agregarProducto({...producto, 
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
=======
import { useToast } from "../context/ContextoToast.jsx";
import { FiShoppingCart, FiRefreshCw, FiTrash2, FiPlus, FiMinus } from "react-icons/fi";

export default function TarjetaProducto({ producto }) {
  const nombreImagen = producto.nombre.toLowerCase().replace(/\s+/g, '-');
  const rutaPrueba = `/images/${nombreImagen}.jpg`;
  const { cart, agregarProducto, eliminar_producto_carrito } = useCart();
  const { mostrarToast } = useToast();
  const productoEnCarrito = cart.find(item => item.id_producto === producto.id_producto);

  // Inicializamos cantidad en 1 si no está en el carrito para que los botones + y - funcionen intuitivamente
  const [cantidad, setCantidad] = useState(productoEnCarrito ? productoEnCarrito.cantidad : 1);
  const [agregado, setAgregado] = useState(!!productoEnCarrito);

  const formatearPrecio = (valor) => {
    const numero = parseFloat(valor) || 0;
    const partes = numero.toFixed(2).split('.');
    partes[0] = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return partes.join(',');
  };

  const manejarAgregarClick = () => {
    const cantVal = parseInt(cantidad);
    if (isNaN(cantVal) || cantVal <= 0) {
      mostrarToast("Por favor, selecciona una cantidad válida.", "error");
      return;
    }
    if (cantVal > producto.stock) {
      mostrarToast("No hay suficiente stock disponible.", "error");
      return;
    }

    agregarProducto({
      ...producto, 
      precio: parseFloat(producto.precio), 
      cantidad: cantVal 
    });
    setAgregado(true);
    mostrarToast(`¡${producto.nombre} agregado al carrito!`, "success");
  };

  const manejarActualizar = () => {
    const cantVal = parseInt(cantidad);
    if (isNaN(cantVal) || cantVal <= 0) {
      mostrarToast("Por favor, selecciona una cantidad válida.", "error");
      return;
    }
    if (cantVal > producto.stock) {
      mostrarToast("No hay suficiente stock disponible.", "error");
      return;
    }
    
    agregarProducto({ 
      ...producto, 
      precio: parseFloat(producto.precio), 
      cantidad: cantVal 
    });
    mostrarToast("Cantidad de producto actualizada", "success");
>>>>>>> Rama_Front
  };

  const manejarEliminar = () => {
    eliminar_producto_carrito(producto.id_producto);
<<<<<<< HEAD
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
=======
    setCantidad(1); // Reseteamos a 1
    setAgregado(false); 
    mostrarToast(`¡${producto.nombre} eliminado del carrito!`, "info");
  };

  return (
    <div className="product-card">
      {/* Badge de disponibilidad */}
      <span style={{
        position: "absolute",
        top: "15px",
        right: "15px",
        backgroundColor: producto.stock > 0 ? "var(--color-caramel-light)" : "#FCE8E6",
        color: producto.stock > 0 ? "var(--color-caramel)" : "#A82E2E",
        fontSize: "0.88rem",
        fontWeight: "bold",
        padding: "6px 14px",
        borderRadius: "20px",
        zIndex: 2,
        boxShadow: "var(--shadow-sm)"
      }}>
        {producto.stock > 0 ? `Stock: ${producto.stock}` : "Agotado"}
      </span>

      {/* Contenedor de Imagen */}
      <div className="product-card-img-wrapper">
        <img 
          src={producto.url_imagen || producto.ruta || rutaPrueba} 
          alt={producto.nombre} 
        />
      </div>

      {/* Info de Producto */}
      <h3 style={{ fontFamily: "var(--font-serif)" }}>{producto.nombre}</h3>
      
      <p className="product-card-desc">
        {producto.descripcion || "Un exquisito y selecto producto de origen lácteo artesanal cuidadosamente elaborado."}
      </p>

      {/* Precio Formateado en es-AR (10.000,00) */}
      <div className="product-card-price">
        <span>${formatearPrecio(producto.precio)}</span>
      </div>

      {/* Acciones */}
      <div style={{ marginTop: "auto" }}>
        {!agregado ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {/* Controles de Cantidad con botones circulares + y - */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "4px" }}>
              <button 
                onClick={() => setCantidad(prev => Math.max(1, parseInt(prev || 1) - 1))}
                className="btn-qty-control"
                disabled={producto.stock <= 0}
                style={{ width: "32px", height: "32px" }}
              >
                <FiMinus />
              </button>
              <span style={{ fontWeight: 700, minWidth: "30px", textAlign: "center", fontSize: "1.05rem", color: "var(--text-dark)" }}>
                {cantidad}
              </span>
              <button 
                onClick={() => setCantidad(prev => Math.min(producto.stock, parseInt(prev || 1) + 1))}
                className="btn-qty-control"
                disabled={producto.stock <= 0 || cantidad >= producto.stock}
                style={{ width: "32px", height: "32px" }}
              >
                <FiPlus />
              </button>
            </div>
            
            <button 
              onClick={manejarAgregarClick} 
              className="btn-green"
              style={{ width: "100%", padding: "12px", fontSize: "0.9rem" }}
              disabled={producto.stock <= 0}
            >
              <FiShoppingCart /> Agregar al Carrito
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {/* Controles de Cantidad para actualizar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", marginBottom: "4px" }}>
              <button 
                onClick={() => setCantidad(prev => Math.max(1, parseInt(prev || 1) - 1))}
                className="btn-qty-control"
                style={{ width: "32px", height: "32px" }}
              >
                <FiMinus />
              </button>
              <span style={{ fontWeight: 700, minWidth: "30px", textAlign: "center", fontSize: "1.05rem", color: "var(--text-dark)" }}>
                {cantidad}
              </span>
              <button 
                onClick={() => setCantidad(prev => Math.min(producto.stock, parseInt(prev || 1) + 1))}
                className="btn-qty-control"
                disabled={cantidad >= producto.stock}
                style={{ width: "32px", height: "32px" }}
              >
                <FiPlus />
              </button>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button 
                onClick={manejarActualizar} 
                className="btn-green"
                style={{ 
                  flex: 1, 
                  padding: "11px 14px", 
                  fontSize: "0.85rem",
                  backgroundColor: "#D48B45", 
                  boxShadow: "none"
                }}
              >
                <FiRefreshCw /> Actualizar
              </button>
              
              <button 
                onClick={manejarEliminar} 
                className="btn-logout"
                style={{ 
                  padding: "11px 14px", 
                  fontSize: "0.85rem", 
                  color: "#A82E2E",
                  borderColor: "#F5D5D3",
                  backgroundColor: "transparent",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                title="Quitar"
              >
                <FiTrash2 />
              </button>
            </div>
          </div>
        )}
      </div>
>>>>>>> Rama_Front
    </div>
  );
}