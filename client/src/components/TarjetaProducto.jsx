import { useState } from "react";
import { useCart } from "../context/ContextoCarrito.jsx";
import { useToast } from "../context/ContextoToast.jsx";
import { useNavigate } from "react-router-dom";
import { FiShoppingCart, FiRefreshCw, FiTrash2, FiPlus, FiMinus } from "react-icons/fi";

export default function TarjetaProducto({ producto }) {
  const nombreImagen = producto.nombre.toLowerCase().replace(/\s+/g, '-');
  const rutaPrueba = `/images/${nombreImagen}.jpg`;
  const { cart, agregarProducto, eliminar_producto_carrito, actualizarCantidad } = useCart();
  const { mostrarToast } = useToast();
  const productoEnCarrito = cart.find(item => item.id_producto === producto.id_producto);

  const navigate = useNavigate();
  // El contador siempre inicia en 1 para representar la cantidad a agregar
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(!!productoEnCarrito);

  const manejarIncremento = () => {
    const cantEnCarrito = productoEnCarrito ? productoEnCarrito.cantidad : 0;
    if (cantidad + cantEnCarrito >= producto.stock) {
      mostrarToast("No hay suficiente stock", "error");
      return;
    }
    setCantidad(prev => prev + 1);
  };

  const formatearPrecio = (valor) => {
    const numero = parseFloat(valor) || 0;
    const partes = numero.toFixed(2).split('.');
    partes[0] = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return partes.join(',');
  };

  // PASO 2.1 y 2.1.1 de la conversación UML: validarStock(cantidad) == false
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
    const exitoAgregar = agregarProducto({
      ...producto, 
      precio: parseFloat(producto.precio), 
      cantidad: cantVal 
    });
    if (exitoAgregar) {
      setAgregado(true);
      mostrarToast(`¡${producto.nombre} agregado al carrito!`, "success");
      setCantidad(1); // Resetea a 1
    }
  };

  // Manejador para actualizar cantidades desde el catálogo (ahora en lógica aditiva "Agregar más")
  const manejarActualizar = () => {
    const cantVal = parseInt(cantidad);

    if (isNaN(cantVal) || cantVal <= 0) {
      mostrarToast("Por favor, selecciona una cantidad válida.", "error");
      return;
    }

    // Validamos que la cantidad actual en el carrito más la nueva a agregar no exceda el stock
    const cantEnCarrito = productoEnCarrito ? productoEnCarrito.cantidad : 0;
    if (cantVal + cantEnCarrito > producto.stock) {
      mostrarToast("No hay suficiente stock", "error");
      return;
    }

    const exitoActualizar = agregarProducto({
      ...producto,
      precio: parseFloat(producto.precio),
      cantidad: cantVal
    });
    if (exitoActualizar) {
      mostrarToast(`¡Cantidad de ${producto.nombre} actualizada!`, "success");
      setCantidad(1); // Resetea el contador local a 1
    }
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
        backgroundColor: producto.stock > 0 ? "#EAF2F8" : "#FCE8E6",
        color: producto.stock > 0 ? "#246295" : "#A82E2E",
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
                style={{ width: "32px", height: "32px" }}
              >
                <FiMinus />
              </button>
              <span style={{ fontWeight: 700, minWidth: "30px", textAlign: "center", fontSize: "1.05rem", color: "var(--text-dark)" }}>
                {cantidad}
              </span>
              <button 
                onClick={manejarIncremento}
                className="btn-qty-control"
                style={{ width: "32px", height: "32px" }}
              >
                <FiPlus />
              </button>
            </div>
            
            <button 
              onClick={manejarAgregarClick} 
              className="btn-blue"
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
                onClick={manejarIncremento}
                className="btn-qty-control"
                style={{ width: "32px", height: "32px" }}
              >
                <FiPlus />
              </button>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button 
                onClick={manejarActualizar} 
                className="btn-blue-outline"
                style={{ 
                  flex: 1, 
                  padding: "11px 14px", 
                  fontSize: "0.85rem"
                }}
              >
                <FiShoppingCart /> Agregar más
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