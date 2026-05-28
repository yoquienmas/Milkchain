import { useState } from "react";
import { useCart } from "../context/ContextoCarrito.jsx";
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

  // PASO 2.1.1 de la conversación UML: validarStock(cantidad) == false
  const validarStock = (cant) => {
    return parseInt(cant) <= producto.stock;
  };

  // Orquestador del evento del botón (Paso 2)
  const manejarAgregarClick = () => {
    const cantVal = parseInt(cantidad);

    if (isNaN(cantVal) || cantVal <= 0) {
      mostrarToast("Por favor, selecciona una cantidad válida.", "error");
      return;
    }

    // PASO 2.1.1: Invocación idéntica a la conversación UML
    if (validarStock(cantVal) === false) {
      // PASO 2.1.2: Mensaje alternativo
      mostrarToast("No hay suficiente stock", "error");
      return;
    }

    // PASO 2.1: Añade el producto mutando el estado global
    agregarProducto({
      ...producto, 
      precio: parseFloat(producto.precio), 
      cantidad: cantVal 
    });
    setAgregado(true);
    mostrarToast(`¡${producto.nombre} agregado al carrito!`, "success");
  };

  // Manejador para actualizar cantidades desde el catálogo
  const manejarActualizar = () => {
    const cantVal = parseInt(cantidad);

    if (isNaN(cantVal) || cantVal <= 0) {
      mostrarToast("Por favor, selecciona una cantidad válida.", "error");
      return;
    }

    // Volvemos a evaluar las reglas de stock del flujo para la actualización
    if (validarStock(cantVal) === false) {
      mostrarToast("No hay suficiente stock", "error");
      return;
    }

    agregarProducto({
      ...producto,
      precio: parseFloat(producto.precio),
      cantidad: cantVal
    });
    mostrarToast(`¡Cantidad de ${producto.nombre} actualizada!`, "success");
  };

  const manejarEliminar = () => {
    eliminar_producto_carrito(producto.id_producto);
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
    </div>
  );
}