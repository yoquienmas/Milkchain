import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/ContextoAutenticacion.jsx";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ContextoToast.jsx";
import { 
  FiSearch, FiEye, FiEdit2, FiTrash2, FiTrendingUp, FiPrinter, 
  FiUser, FiCalendar, FiFileText, FiX, FiAward, FiTag, FiDollarSign 
} from "react-icons/fi";
import "../App.css";
import { AdaptadorWindowPrint, SistemaImpresionNativa } from "../services/AdaptadorFactura.jsx";// Importación del Adaptador GoF para Impresión Nativa

function PedidoPagina() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { mostrarToast } = useToast();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [pedidoAEditar, setPedidoAEditar] = useState(null);
  const [detalleSeleccionado, setDetalleSeleccionado] = useState(null);
  const [pedidoCompletoAEditar, setPedidoCompletoAEditar] = useState(null);

  const mapaEstados = {
    "Pendiente": 1,
    "Preparación": 2,
    "Enviado": 3,
    "En camino": 4,
    "Entregado": 5,
    "Cancelado": 6
  };

  const formatearPrecio = (valor) => {
    const numero = parseFloat(valor) || 0;
    const partes = numero.toFixed(2).split('.');
    partes[0] = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return partes.join(',');
  };

  // PASO 1.1: Método de validación de rol
  const validarAdministrador = (rol) => {
    return rol === 1 || 
           user?.idRol === 1 || 
           user?.id_rol === 1 || 
           user?.nombre?.toLowerCase() === 'admin' ||
           user?.rol?.toLowerCase() === 'administrador';
  };
  
  const esAdmin = validarAdministrador(user?.id_rol || user?.idRol);

  // PASO 1.1 y 1.1.2: Obtener pedidos o vista de cliente
  const obtenerTodosLosPedidos = async () => {
    try {
      setLoading(true);
      const url = esAdmin 
        ? "http://localhost:3000/api/pedidos/all" 
        : `http://localhost:3000/api/pedidos/${user?.id_usuario || user?.id}`;
        
      const res = await axios.get(url, { withCredentials: true });
      setPedidos(res.data);
    } catch (err) {
      console.error("Error cargando pedidos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      obtenerTodosLosPedidos();
    }
  }, [user]);

  const verDetalle = async (id_Pedido) => {
    try {
      const res = await axios.get(`http://localhost:3000/api/pedidos/detalle/${id_Pedido}`);
      setDetalleSeleccionado({ id: id_Pedido, productos: res.data });
    } catch (err) {
      mostrarToast("No se pudo cargar el detalle del pedido.", "error");
    }
  };

  const eliminarPedido = async (id) => {
    if (window.confirm(`¿Estás seguro de eliminar permanentemente el pedido #${id}?`)) {
      try {
        await axios.delete(`http://localhost:3000/api/pedidos/${id}`);
        obtenerTodosLosPedidos();
        mostrarToast(`Pedido #${id} eliminado con éxito.`, "info");
      } catch (err) { 
        mostrarToast("Error al eliminar el pedido.", "error"); 
      }
    }
  };

  // PASO 2.1: Interfaz con opciones de estado
  const buscar_estados = () => {
    return Object.keys(mapaEstados);
  };

  // PASO 3.1: Captura el identificador localmente
  const procesarSeleccionEstado = (e) => {
    setPedidoAEditar({ ...pedidoAEditar, id_estado: Number(e.target.value) });
  };

  // Método de validación local del modal de selección según contrato
  const validarSeleccion = (Estado) => {
    return Estado !== undefined && Estado !== null && Estado !== "";
  };

  // PASO 4.1: Persiste el cambio y gestiona flujo alternativo
  const actualizarEstado = async (e, Pedido, Estado) => {
    e.preventDefault();
    // Validación según contrato: Falta de selección / Campos no válidos
    if (!validarSeleccion(Estado)) {
      return mostrarToast("Campos no válidos", "error");
    }
    try {
      await axios.patch(`http://localhost:3000/api/pedidos/estado/${Pedido}`, { nuevoEstadoId: Estado });
      setPedidoAEditar(null);
      obtenerTodosLosPedidos();
      // PASO 4.2: Confirmación
      mostrarToast("Estado actualizado correctamente", "success");
    } catch (err) { 
      // PASO 4.1.2: Error de conexión
      mostrarToast("No se pudo actualizar el estado", "error"); 
    }
  };

  const abrirModalEdicionDesdeDetalle = (detalle) => {
    const metadata = detalle.productos[0] || {};
    let fechaFormateada = "";
    if (metadata.fecha) {
      const d = new Date(metadata.fecha);
      const offset = d.getTimezoneOffset();
      const dLocal = new Date(d.getTime() - (offset * 60 * 1000));
      fechaFormateada = dLocal.toISOString().split('T')[0];
    }
    setPedidoCompletoAEditar({
      id_pedido: detalle.id,
      fecha: fechaFormateada,
      Total: metadata.total_pedido || 0,
    });
  };

  const actualizarPedidoCompleto = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:3000/api/pedidos/${pedidoCompletoAEditar.id_pedido}`, {
        Total: Number(pedidoCompletoAEditar.Total),
        fecha: pedidoCompletoAEditar.fecha,
      });
      setPedidoCompletoAEditar(null);
      setDetalleSeleccionado(null);
      obtenerTodosLosPedidos();
      mostrarToast("Pedido actualizado con éxito.", "success");
    } catch (err) {
      mostrarToast("Error al actualizar el pedido.", "error");
    }
  };

  // Método de impresión nativa adaptada (Paso 6.1 / Caso de uso 2)
  const manejarImpresionNativa = () => {
    try {
      // 1. Instanciamos el Adaptee (sistema incompatible externo)
      const sistemaNativo = new SistemaImpresionNativa();
      
      // 2. Instanciamos el Adaptador pasándole el Adaptee por composición
      const adaptador = new AdaptadorWindowPrint(sistemaNativo);
      
      // 3. Ejecutamos de forma uniforme el método del Target
      adaptador.imprimir();
    } catch (err) {
      console.error("Error en Adaptador nativo, usando fallback directo:", err);
      window.print();
    }
  };

  const obtenerEstiloEstado = (estado) => {
    const defaultStyle = { bg: "#EADFD3", color: "var(--text-muted)", border: "var(--border-color)" };
    const estadosMapping = {
      "Pendiente": { bg: "#FFF4E5", color: "#B76E00", border: "#FFE0B2" },
      "Preparación": { bg: "#EEF0FC", color: "#3F51B5", border: "#C5CAE9" },
      "Enviado": { bg: "#E1F5FE", color: "#0288D1", border: "#B3E5FC" },
      "En camino": { bg: "#E0F2F1", color: "#00796B", border: "#B2DFDB" },
      "Entregado": { bg: "#E8F5E9", color: "#2E7D32", border: "#C8E6C9" },
      "Cancelado": { bg: "#FFEBEE", color: "#C62828", border: "#FFCDD2" }
    };
    return estadosMapping[estado] || defaultStyle;
  };

  const pedidosFiltrados = pedidos.filter(p => {
    const termino = busqueda.toLowerCase().trim();
    if (!termino) return true;

    const idPedido = p.id_pedido?.toString() || "";
    const nombre = p.nombre_usuario?.toLowerCase() || "";
    const apellido = p.apellido_usuario?.toLowerCase() || "";
    const dni = p.dni_usuario?.toString() || "";

    return idPedido.includes(termino) || 
           nombre.includes(termino) || 
           apellido.includes(termino) || 
           dni.includes(termino);
  });

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', fontFamily: 'var(--font-sans)', color: 'var(--text-dark)', fontWeight: '600' }}>
        Cargando datos de usuario...
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: "40px 6%", maxWidth: "1200px", margin: "0 auto", minHeight: "85vh" }}>
        {/* Skeleton Cabecera del Panel */}
        <div className="skeleton-card" style={{
          backgroundColor: "var(--bg-white)",
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-md)",
          padding: "35px",
          marginBottom: "35px"
        }}>
          <div className="skeleton-title" style={{ width: "180px", height: "20px", marginBottom: "15px" }}></div>
          <div className="skeleton-title" style={{ width: "350px", height: "35px", marginBottom: "15px" }}></div>
          <div className="skeleton-desc" style={{ width: "250px", height: "18px" }}></div>
        </div>

        {/* Skeleton Buscador */}
        <div style={{ 
          display: "flex", 
          justifyContent: "center", 
          marginBottom: "35px", 
          gap: "12px",
          maxWidth: "600px",
          margin: "0 auto 35px auto"
        }}>
          <div className="skeleton-btn" style={{ width: "100%", height: "45px", borderRadius: "var(--radius-sm)" }}></div>
        </div>

        {/* Skeleton Tabla de Pedidos */}
        <div className="cart-table-card skeleton-card" style={{ padding: "30px", backgroundColor: "var(--bg-white)", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "2px solid var(--border-color)", paddingBottom: "12px" }}>
              {[...Array(esAdmin ? 7 : 5)].map((_, idx) => (
                <div key={idx} className="skeleton-title" style={{ width: "80px", height: "20px", marginBottom: 0 }}></div>
              ))}
            </div>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "15px" }}>
                <div className="skeleton-title" style={{ width: "60px", height: "20px", marginBottom: 0 }}></div>
                <div className="skeleton-title" style={{ width: "100px", height: "20px", marginBottom: 0 }}></div>
                {esAdmin && <div className="skeleton-title" style={{ width: "80px", height: "20px", marginBottom: 0 }}></div>}
                {esAdmin && <div className="skeleton-title" style={{ width: "120px", height: "20px", marginBottom: 0 }}></div>}
                <div className="skeleton-title" style={{ width: "80px", height: "20px", marginBottom: 0 }}></div>
                <div className="skeleton-title" style={{ width: "90px", height: "25px", borderRadius: "20px", marginBottom: 0 }}></div>
                <div className="skeleton-btn" style={{ width: "100px", height: "32px", marginBottom: 0 }}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px 6%", maxWidth: "1200px", margin: "0 auto", minHeight: "85vh" }}>
      
      {/* Cabecera del Panel */}
      <div style={{
        backgroundColor: "var(--bg-white)",
        border: "1px solid var(--border-color)",
        borderRadius: "var(--radius-md)",
        padding: "35px",
        boxShadow: "var(--shadow-sm)",
        marginBottom: "35px",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{ position: "relative", zIndex: 2 }}>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2.2rem", color: "var(--text-dark)", marginBottom: "8px" }}>
            {esAdmin ? "Panel de Gestión de Pedidos" : "Mis Pedidos"}
          </h1>
          {esAdmin && (
            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "6px" }}>
              <FiUser style={{ color: "var(--color-caramel)" }} />
              <span>Conectado como: <strong>{user?.nombre} {user?.apellido || ""}</strong></span>
            </p>
          )}
        </div>
      </div>

      {/* Buscador Estilizado */}
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        marginBottom: "35px", 
        gap: "12px",
        maxWidth: "600px",
        margin: "0 auto 35px auto"
      }}>
        <div style={{ position: "relative", flex: 1 }}>
          <FiSearch style={{
            position: "absolute",
            left: "14px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--text-muted)",
            fontSize: "1.1rem"
          }} />
          <input
            type="text"
            placeholder={esAdmin ? "Buscar por ID, DNI, Nombre o Apellido del cliente..." : "Buscar por número de pedido..."}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ 
              paddingLeft: "44px",
              width: "100%",
              borderRadius: "var(--radius-sm)"
            }}
          />
        </div>
      </div>
      
      {/* Contenedor de la Tabla */}
      {pedidosFiltrados.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "50px 20px",
          backgroundColor: "var(--bg-white)",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--border-color)",
          color: "var(--text-muted)",
          boxShadow: "var(--shadow-sm)"
        }}>
          <FiFileText style={{ fontSize: "3rem", color: "var(--color-caramel)", marginBottom: "15px", opacity: 0.6 }} />
          <p style={{ fontSize: "1.1rem" }}>No se encontraron pedidos que coincidan con la búsqueda.</p>
        </div>
      ) : (
        <div className="cart-table-card">
          <table className="cart-table">
            <thead>
              <tr>
                <th style={{ padding: "16px 20px" }}>ID</th>
                <th style={{ padding: "16px 20px" }}>Fecha</th>
                {esAdmin && <th style={{ padding: "16px 20px" }}>DNI Cliente</th>}
                {esAdmin && <th style={{ padding: "16px 20px" }}>Cliente</th>}
                <th style={{ padding: "16px 20px", textAlign: "right" }}>Total</th>
                <th style={{ padding: "16px 20px", textAlign: "center" }}>Estado</th>
                <th style={{ padding: "16px 20px", textAlign: "center" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.map(p => {
                const estilo = obtenerEstiloEstado(p.estado || "Pendiente");
                return (
                  <tr key={p.id_pedido}>
                    <td style={{ fontWeight: 700, color: "var(--color-caramel)" }}>#{p.id_pedido}</td>
                    <td style={{ color: "var(--text-muted)" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <FiCalendar /> {new Date(p.fecha).toLocaleDateString()}
                      </span>
                    </td>
                    
                    {esAdmin && <td style={{ fontWeight: "600" }}>{p.dni_usuario || "---"}</td>}
                    {esAdmin && <td>{p.nombre_usuario && p.apellido_usuario ? `${p.apellido_usuario}, ${p.nombre_usuario}` : "Cliente"}</td>}
                    
                    <td style={{ textAlign: "right", fontWeight: 700, fontSize: "1.05rem" }}>
                      ${formatearPrecio(p.Total || p.total || 0)}
                    </td>
                    
                    <td style={{ textAlign: "center" }}>
                      <span style={{ 
                        color: estilo.color, 
                        fontWeight: "bold",
                        backgroundColor: estilo.bg,
                        padding: "5px 12px",
                        borderRadius: "20px",
                        fontSize: "0.85rem",
                        border: `1.5px solid ${estilo.border}`,
                        display: "inline-block"
                      }}>
                        {p.estado || "Pendiente"}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
                        <button 
                          onClick={() => verDetalle(p.id_pedido)} 
                          className="btn-green"
                          style={{ padding: "8px 14px", fontSize: "0.85rem", boxShadow: "none" }}
                        >
                          <FiEye /> Detalle
                        </button>
 
                        {esAdmin && (
                          <>
                            {/* PASO 2: Botón Cambiar Estado */}
                            <button 
                              onClick={() => setPedidoAEditar({ ...p, id_estado: mapaEstados[p.estado] || 1 })} 
                              className="btn-green"
                              style={{ 
                                padding: "8px 14px", 
                                fontSize: "0.85rem", 
                                backgroundColor: "#3498DB", 
                                boxShadow: "none" 
                              }}
                            >
                              <FiTrendingUp /> Cambiar estado
                            </button>
                            <button 
                              onClick={() => eliminarPedido(p.id_pedido)} 
                              className="btn-logout"
                              style={{ 
                                padding: "8px 14px", 
                                fontSize: "0.85rem", 
                                color: "#A82E2E",
                                borderColor: "#F5D5D3",
                                backgroundColor: "transparent"
                              }}
                            >
                              <FiTrash2 /> Eliminar
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL DE DETALLE / FACTURA COMPROBANTE */}
      {detalleSeleccionado && (
        <div style={modalOverlayStyle}>
          <div style={{...modalContentStyle, width: "90%", maxWidth: "600px"}} className="print-container">
            <div className="no-print" style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
              <button 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  fontSize: '1.4rem', 
                  cursor: 'pointer', 
                  color: "var(--text-muted)",
                  transition: "color 0.2s"
                }} 
                onClick={() => setDetalleSeleccionado(null)}
                aria-label="Cerrar modal"
              >
                <FiX />
              </button>
            </div>
            
            <div style={{
              borderBottom: '2.5px dashed var(--border-color)', 
              marginBottom: '20px', 
              textAlign: 'left', 
              paddingBottom: "15px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ color: "var(--color-caramel)", margin: 0, fontFamily: "var(--font-serif)", fontSize: "1.8rem" }}>
                  MilkChain
                </h2>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "600" }}>Comprobante Oficial</span>
              </div>
              <div style={{ marginTop: "15px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "0.9rem" }}>
                <p><strong>Pedido:</strong> #{detalleSeleccionado.id}</p>
                <p><strong>Fecha:</strong> {detalleSeleccionado.productos[0] ? new Date(detalleSeleccionado.productos[0].fecha).toLocaleDateString() : ''}</p>
                <p style={{ gridColumn: "span 2" }}>
                  <strong>Cliente:</strong> {detalleSeleccionado.productos[0]?.nombre_cliente || "Consumidor Final"}
                </p>
              </div>
            </div>

            <table style={{ width: '100%', marginBottom: '20px', borderCollapse: 'collapse', fontSize: "0.95rem" }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', color: "var(--text-dark)", fontWeight: "700" }}>
                  <th style={{ textAlign: 'left', padding: '10px 8px' }}>Producto</th>
                  <th style={{ padding: '10px 8px', textAlign: "center" }}>Cant.</th>
                  <th style={{ padding: '10px 8px', textAlign: "center" }}>Precio</th>
                  <th style={{ textAlign: 'right', padding: '10px 8px' }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {detalleSeleccionado.productos.map((prod, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 8px', textAlign: 'left', fontWeight: "600" }}>{prod.nombre}</td>
                    <td style={{ textAlign: 'center', padding: '12px 8px' }}>{prod.cantidad}</td>
                    <td style={{ textAlign: 'center', padding: '12px 8px', color: "var(--text-muted)" }}>
                      ${formatearPrecio(prod.precio_unitario)}
                    </td>
                    <td style={{ textAlign: 'right', padding: '12px 8px', fontWeight: "700", color: "var(--color-caramel)" }}>
                      ${formatearPrecio(parseFloat(prod.cantidad || 0) * parseFloat(prod.precio_unitario || 0))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{
              display: "flex", 
              justifyContent: "flex-end", 
              alignItems: "baseline",
              gap: "10px",
              fontSize: '1.4rem', 
              fontWeight: 'bold', 
              marginTop: '20px',
              color: "var(--text-dark)",
              borderTop: "1px solid var(--border-color)",
              paddingTop: "15px"
            }}>
              <span>Total:</span>
              <span style={{ color: "var(--color-caramel)", fontFamily: "var(--font-serif)" }}>
                ${formatearPrecio(detalleSeleccionado.productos[0]?.total_pedido)}
              </span>
            </div>

            <div style={{ marginTop: "35px", display: "flex", gap: "10px" }} className="no-print">
              <button 
                onClick={manejarImpresionNativa} 
                className="btn-green"
                style={{ flex: 1, padding: "12px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
              >
                <FiPrinter /> Imprimir Factura
              </button>
              {esAdmin && (
                <button 
                  onClick={() => abrirModalEdicionDesdeDetalle(detalleSeleccionado)} 
                  className="btn-green"
                  style={{ 
                    flex: 1, 
                    padding: "12px", 
                    display: "inline-flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    gap: "8px", 
                    backgroundColor: "var(--color-caramel)", 
                    color: "white" 
                  }}
                >
                  <FiEdit2 /> Editar Pedido
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL CAMBIAR ESTADO (Solo Admin) */}
      {pedidoAEditar && (
        <div style={modalOverlayStyle}>
          {/* PASO 4: Presiona botón Guardar Cambios */}
          <form onSubmit={(e) => actualizarEstado(e, pedidoAEditar.id_pedido, pedidoAEditar.id_estado)} style={modalContentStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", color: "var(--text-dark)", margin: 0 }}>
                Cambiar Estado #{pedidoAEditar.id_pedido}
              </h3>
              <button 
                type="button"
                style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: "var(--text-muted)" }} 
                onClick={() => setPedidoAEditar(null)}
              >
                <FiX />
              </button>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "18px", textAlign: "left" }}>
              <div>
                <label style={{ fontWeight: "700", fontSize: "0.9rem", color: "var(--text-dark)", display: "block", marginBottom: "6px" }}>
                  Estado logístico del Pedido:
                </label>
                <div style={{ position: "relative" }}>
                  <FiTag style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                  <select 
                    style={{ 
                      paddingLeft: "34px", 
                      width: "100%", 
                      padding: "12px 12px 12px 34px", 
                      border: "1.5px solid var(--border-color)", 
                      borderRadius: "var(--radius-sm)", 
                      backgroundColor: "var(--bg-white)", 
                      color: "var(--text-dark)", 
                      outline: "none" 
                    }} 
                    value={pedidoAEditar.id_estado} 
                    onChange={procesarSeleccionEstado}
                  >
                    {buscar_estados().map(nombreEstado => (
                      <option key={mapaEstados[nombreEstado]} value={mapaEstados[nombreEstado]}>
                        {nombreEstado}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "35px" }}>
              <button type="submit" className="btn-green" style={{ flex: 1, padding: "12px" }}>
                Guardar Cambios
              </button>
              <button 
                type="button" 
                onClick={() => setPedidoAEditar(null)} 
                className="btn-logout"
                style={{ flex: 1, padding: "12px", justifyContent: "center", fontWeight: "600" }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL EDITAR PEDIDO COMPLETO (Solo Admin) */}
      {pedidoCompletoAEditar && (
        <div style={modalOverlayStyle}>
          <form onSubmit={actualizarPedidoCompleto} style={modalContentStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", color: "var(--text-dark)", margin: 0 }}>
                Editar Pedido #{pedidoCompletoAEditar.id_pedido}
              </h3>
              <button 
                type="button"
                style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: "var(--text-muted)" }} 
                onClick={() => setPedidoCompletoAEditar(null)}
              >
                <FiX />
              </button>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "18px", textAlign: "left" }}>
              <div>
                <label style={{ fontWeight: "700", fontSize: "0.9rem", color: "var(--text-dark)", display: "block", marginBottom: "6px" }}>
                  Fecha:
                </label>
                <input 
                  type="date"
                  style={{ 
                    width: "100%", 
                    padding: "12px", 
                    border: "1.5px solid var(--border-color)", 
                    borderRadius: "var(--radius-sm)" 
                  }} 
                  value={pedidoCompletoAEditar.fecha}
                  required
                  onChange={(e) => setPedidoCompletoAEditar({ ...pedidoCompletoAEditar, fecha: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontWeight: "700", fontSize: "0.9rem", color: "var(--text-dark)", display: "block", marginBottom: "6px" }}>
                  Total:
                </label>
                <input 
                  type="number"
                  step="0.01"
                  style={{ 
                    width: "100%", 
                    padding: "12px", 
                    border: "1.5px solid var(--border-color)", 
                    borderRadius: "var(--radius-sm)" 
                  }} 
                  value={pedidoCompletoAEditar.Total}
                  required
                  onChange={(e) => setPedidoCompletoAEditar({ ...pedidoCompletoAEditar, Total: e.target.value })}
                />
              </div>
             </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "35px" }}>
              <button type="submit" className="btn-green" style={{ flex: 1, padding: "12px" }}>
                Guardar Cambios
              </button>
              <button 
                type="button" 
                onClick={() => setPedidoCompletoAEditar(null)} 
                className="btn-logout"
                style={{ flex: 1, padding: "12px", justifyContent: "center", fontWeight: "600" }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

const modalOverlayStyle = { 
  position: "fixed", 
  top: 0, 
  left: 0, 
  width: "100%", 
  height: "100%", 
  backgroundColor: "rgba(32, 20, 15, 0.4)", 
  display: "flex", 
  justifyContent: "center", 
  alignItems: "center", 
  zIndex: 1000, 
  backdropFilter: "blur(4px)" 
};

const modalContentStyle = { 
  background: "var(--bg-white)", 
  padding: "min(40px, 6vw)", 
  borderRadius: "var(--radius-md)", 
  width: "90%", 
  maxWidth: "480px", 
  boxShadow: "var(--shadow-lg)",
  border: "1px solid var(--border-color)",
  maxHeight: "90vh",
  overflowY: "auto"
};

export default PedidoPagina;