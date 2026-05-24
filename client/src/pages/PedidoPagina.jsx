<<<<<<< HEAD
import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/ContextoAutenticacion.jsx";
import { useNavigate } from "react-router-dom";

function PedidoPagina() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState(""); // Estado para el buscador
  
  const [pedidoAEditar, setPedidoAEditar] = useState(null);
  const [detalleSeleccionado, setDetalleSeleccionado] = useState(null);

  const mapaEstados = {
    "Pendiente": 1,
    "Preparación": 2,
    "Enviado": 3,
    "En camino": 4,
    "Entregado": 5,
    "Cancelado": 6
  };

  const esAdmin = user?.id_rol === 1 || user?.idRol === 1 || user?.rol === 1 || user?.nombre === 'admin';

  const buscarPedidos = async () => {
    try {
      setLoading(true);
      const url = esAdmin 
        ? "http://localhost:3000/api/pedidos/all" 
        : `http://localhost:3000/api/pedidos/${user?.id_usuario}`;
        
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
        buscarPedidos();
    }
  }, [user]);

  const verDetalle = async (id_Pedido) => {
    try {
      const res = await axios.get(`http://localhost:3000/api/pedidos/detalle/${id_Pedido}`);
      setDetalleSeleccionado({ id: id_Pedido, productos: res.data });
    } catch (err) {
      alert("No se pudo cargar el detalle del pedido");
    }
  };

  const eliminarPedido = async (id) => {
    if (window.confirm(`¿Estás seguro de eliminar el pedido #${id}?`)) {
      try {
        await axios.delete(`http://localhost:3000/api/pedidos/${id}`);
        buscarPedidos();
      } catch (err) { alert("Error al eliminar"); }
    }
  };

  const cambiarEstado = async (id, estadoNombreActual) => {
    const ordenEstados = ["Pendiente", "Preparación", "Enviado", "En camino", "Entregado", "Cancelado"];
    let siguienteIndex = (ordenEstados.indexOf(estadoNombreActual) + 1) % ordenEstados.length;
    let siguienteNombre = ordenEstados[siguienteIndex];
    let siguienteId = mapaEstados[siguienteNombre];
    
    try {
      await axios.patch(`http://localhost:3000/api/pedidos/estado/${id}`, { nuevoEstadoId: siguienteId });
      buscarPedidos();
    } catch (err) { alert("Error al cambiar estado"); }
  };

  const guardarEdicion = async (e) => {
    e.preventDefault();
    try {
        await axios.put(`http://localhost:3000/api/pedidos/${pedidoAEditar.id_pedido}`, {
          Total: pedidoAEditar.Total || pedidoAEditar.total,
          id_estado: pedidoAEditar.id_estado
        });
        setPedidoAEditar(null);
        buscarPedidos();
    } catch (err) { alert("Error al editar pedido"); }
  };

  const imprimirFactura = () => {
    window.print();
  };

  // --- LÓGICA DE FILTRADO PARA EL BUSCADOR ---
  const pedidosFiltrados = pedidos.filter(p => {
    const termino = busqueda.toLowerCase().trim();
    if (!termino) return true;

    const idPedido = p.id_pedido?.toString() || "";
    const nombre = p.nombre_usuario?.toLowerCase() || "";
    const apellido = p.apellido_usuario?.toLowerCase() || "";
    const dni = p.dni_usuario?.toString() || "";

    // El admin puede buscar por todo; el cliente común por ID de pedido
    return idPedido.includes(termino) || 
           nombre.includes(termino) || 
           apellido.includes(termino) || 
           dni.includes(termino);
  });

  if (!user) {
    return <p>Cargando datos de usuario...</p>;
  }

  if (loading) return <div style={{ textAlign: "center", padding: "50px" }}>Cargando información de MilkChain...</div>;

  return (
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto", minHeight: "80vh" }}>
      <h1 style={{ color: "#248a4d" }}>
        {esAdmin ? "Panel de Gestión (Administrador)" : "Mis Pedidos"}
      </h1>
      <p style={{ color: "#666" }}>
        Conectado como: <strong>{user?.nombre || "Usuario"}</strong> ({esAdmin ? "Admin" : "Cliente"})
      </p>
      <hr />

      {/* RECUADRO DEL BUSCADOR */}
      <div style={{ marginTop: "20px", marginBottom: "10px" }}>
        <input
          type="text"
          placeholder={esAdmin ? "Buscar por ID, Nombre, Apellido o DNI del cliente..." : "Buscar por número de pedido..."}
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 20px",
            fontSize: "1rem",
            borderRadius: "8px",
            border: "2px solid #248a4d",
            boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
            outline: "none"
          }}
        />
      </div>
      
      {pedidosFiltrados.length === 0 ? (
        <p style={{ marginTop: "20px", color: "#888" }}>No se encontraron pedidos que coincidan con la búsqueda.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px", backgroundColor: "white", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
          <thead>
            <tr style={{ background: "#f8f9fa", borderBottom: "2px solid #dee2e6" }}>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Fecha</th>
              {esAdmin && <th style={thStyle}>DNI Cliente</th>}
              {esAdmin && <th style={thStyle}>Apellido y Nombre</th>}
              <th style={thStyle}>Total</th>
              <th style={thStyle}>Estado</th>
              <th style={thStyle}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pedidosFiltrados.map(p => (
              <tr key={p.id_pedido} style={{ borderBottom: "1px solid #eee" }}>
                <td style={tdStyle}>#{p.id_pedido}</td>
                <td style={tdStyle}>{new Date(p.fecha).toLocaleDateString()}</td>
                
                {/* COLUMNAS NUEVAS PARA VERIFICACIÓN VISUAL DEL ADMIN */}
                {esAdmin && <td style={tdStyle, {fontWeight: "500", color: "#4a5568"}}>{p.dni_usuario || "---"}</td>}
                {esAdmin && <td style={tdStyle}>{p.nombre_usuario && p.apellido_usuario ? `${p.apellido_usuario}, ${p.nombre_usuario}` : "No especificado"}</td>}
                
                <td style={tdStyle}>
                    <strong>${Number(p.Total || p.total || 0).toFixed(2)}</strong>
                </td>
                
                <td style={tdStyle}>
                  <span style={{ 
                    color: p.estado === 'Cancelado' ? '#e57373' : '#248a4d', 
                    fontWeight: "bold",
                    backgroundColor: p.estado === 'Cancelado' ? '#fff5f5' : '#f0fdf4',
                    padding: "4px 10px",
                    borderRadius: "20px",
                    fontSize: "0.9rem",
                    border: `1px solid ${p.estado === 'Cancelado' ? '#feb2b2' : '#c6f6d5'}`
                  }}>
                    {p.estado || "Pendiente"}
                  </span>
                </td>
                <td style={tdStyle}>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <button onClick={() => verDetalle(p.id_pedido)} style={btnDetailStyle}>
                        Ver Detalles
                    </button>

                    {esAdmin && (
                      <>
                        <button 
                            onClick={() => setPedidoAEditar({ ...p, id_estado: mapaEstados[p.estado] || 1 })} 
                            className="btn-edit" 
                            style={{ backgroundColor: '#ffc107', color: 'black', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            Editar
                        </button>
                        <button 
                            onClick={() => cambiarEstado(p.id_pedido, p.estado)} 
                            className="btn-status"
                            style={{ backgroundColor: '#17a2b8', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            Siguiente Estado
                        </button>
                        <button 
                            onClick={() => eliminarPedido(p.id_pedido)} 
                            className="btn-delete"
                            style={{ backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            Eliminar
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* MODAL DE DETALLE / FACTURA COMPROBANTE */}
      {detalleSeleccionado && (
        <div style={modalOverlayStyle}>
          <div style={{...modalContentStyle, width: "600px"}} className="print-container">
            <div className="no-print" style={{textAlign: 'right'}}>
                <button style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }} onClick={() => setDetalleSeleccionado(null)}>✕</button>
            </div>
            
            <div style={{borderBottom: '2px solid #248a4d', marginBottom: '20px', textAlign: 'left'}}>
              <h2 style={{ color: "#248a4d", margin: '0 0 10px 0' }}>MilkChain - Comprobante</h2>
              <p><strong>Pedido:</strong> #{detalleSeleccionado.id}</p>
              <p><strong>Fecha:</strong> {detalleSeleccionado.productos[0] ? new Date(detalleSeleccionado.productos[0].fecha).toLocaleDateString() : ''}</p>
              <p><strong>Cliente:</strong> {detalleSeleccionado.productos[0]?.nombre_cliente || "Consumidor Final"}</p>
            </div>

            <table style={{width: '100%', marginBottom: '20px', borderCollapse: 'collapse'}}>
              <thead>
                <tr style={{borderBottom: '2px solid #ddd'}}>
                  <th style={{textAlign: 'left', padding: '8px'}}>Producto</th>
                  <th style={{padding: '8px'}}>Cant.</th>
                  <th style={{padding: '8px'}}>Precio</th>
                  <th style={{textAlign: 'right', padding: '8px'}}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {detalleSeleccionado.productos.map((prod, index) => (
                  <tr key={index} style={{borderBottom: '1px solid #eee'}}>
                      <td style={{padding: '8px', textAlign: 'left'}}>{prod.nombre}</td>
                      <td style={{textAlign: 'center', padding: '8px'}}>{prod.cantidad}</td>
                      <td style={{textAlign: 'center', padding: '8px'}}>${parseFloat(prod.precio_unitario || 0).toFixed(2)}</td>
                      <td style={{textAlign: 'right', padding: '8px'}}>${(parseFloat(prod.cantidad || 0) * parseFloat(prod.precio_unitario || 0)).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{textAlign: 'right', fontSize: '1.2rem', fontWeight: 'bold', marginTop: '15px'}}>
              Total: ${parseFloat(detalleSeleccionado.productos[0]?.total_pedido || 0).toFixed(2)}
            </div>

            <div style={{ marginTop: "30px" }} className="no-print">
              <button onClick={imprimirFactura} style={btnConfirmStyle}>Imprimir Factura</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR (Solo Admin) */}
      {pedidoAEditar && (
        <div style={modalOverlayStyle}>
          <form onSubmit={guardarEdicion} style={modalContentStyle}>
            <h3 style={{ marginBottom: "20px" }}>Editar Pedido #{pedidoAEditar.id_pedido}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "15px", textAlign: "left" }}>
                <label style={{ fontWeight: "bold" }}>Monto Total:</label>
                <input style={inputStyle} type="number" step="0.01" value={pedidoAEditar.total || ''} onChange={e => setPedidoAEditar({...pedidoAEditar, total: e.target.value})} />
                
                <label style={{ fontWeight: "bold" }}>Estado del Pedido:</label>
                <select style={inputStyle} value={pedidoAEditar.id_estado} onChange={e => setPedidoAEditar({...pedidoAEditar, id_estado: Number(e.target.value)})}>
                    <option value={1}>Pendiente</option>
                    <option value={2}>Preparación</option>
                    <option value={3}>Enviado</option>
                    <option value={4}>En camino</option>
                    <option value={5}>Entregado</option>
                    <option value={6}>Cancelado</option>
                </select>
            </div>
            <div style={{ display: "flex", gap: "10px", marginTop: "25px" }}>
                <button type="submit" style={btnConfirmStyle}>Guardar Cambios</button>
                <button type="button" onClick={() => setPedidoAEditar(null)} style={btnCancelStyle}>Cancelar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

const thStyle = { padding: "15px", textAlign: "left", color: "#4a5568", fontWeight: "600" };
const tdStyle = { padding: "15px", color: "#2d3748" };
const inputStyle = { padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e0", fontSize: "1rem" };
const btnDetailStyle = { background: "#248a4d", color: "white", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: "600", transition: "0.2s" };
const modalOverlayStyle = { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, backdropFilter: "blur(2px)" };
const modalContentStyle = { background: "white", padding: "35px", borderRadius: "20px", width: "450px", textAlign: "center", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" };
const btnConfirmStyle = { flex: 1, padding: "12px", backgroundColor: "#248a4d", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" };
const btnCancelStyle = { flex: 1, padding: "12px", backgroundColor: "#edf2f7", color: "#4a5568", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" };

=======
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

function PedidoPagina() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { mostrarToast } = useToast();
  const [pedidos, setPedidos] = useState([]);

  const formatearPrecio = (valor) => {
    const numero = parseFloat(valor) || 0;
    const partes = numero.toFixed(2).split('.');
    partes[0] = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return partes.join(',');
  };
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  
  const [pedidoAEditar, setPedidoAEditar] = useState(null);
  const [detalleSeleccionado, setDetalleSeleccionado] = useState(null);

  const mapaEstados = {
    "Pendiente": 1,
    "Preparación": 2,
    "Enviado": 3,
    "En camino": 4,
    "Entregado": 5,
    "Cancelado": 6
  };

  const esAdmin = user?.id_rol === 1 || user?.idRol === 1 || user?.rol === 1 || user?.nombre?.toLowerCase() === 'admin';

  const buscarPedidos = async () => {
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
      buscarPedidos();
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
        buscarPedidos();
        mostrarToast(`Pedido #${id} eliminado con éxito.`, "info");
      } catch (err) { 
        mostrarToast("Error al eliminar el pedido.", "error"); 
      }
    }
  };

  const cambiarEstado = async (id, estadoNombreActual) => {
    const ordenEstados = ["Pendiente", "Preparación", "Enviado", "En camino", "Entregado", "Cancelado"];
    let siguienteIndex = (ordenEstados.indexOf(estadoNombreActual) + 1) % ordenEstados.length;
    let siguienteNombre = ordenEstados[siguienteIndex];
    let siguienteId = mapaEstados[siguienteNombre];
    
    try {
      await axios.patch(`http://localhost:3000/api/pedidos/estado/${id}`, { nuevoEstadoId: siguienteId });
      buscarPedidos();
      mostrarToast(`Estado del pedido #${id} actualizado a ${siguienteNombre}.`, "success");
    } catch (err) { 
      mostrarToast("Error al cambiar el estado del pedido.", "error"); 
    }
  };

  const guardarEdicion = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:3000/api/pedidos/${pedidoAEditar.id_pedido}`, {
        Total: pedidoAEditar.Total || pedidoAEditar.total,
        id_estado: pedidoAEditar.id_estado
      });
      setPedidoAEditar(null);
      buscarPedidos();
      mostrarToast(`Pedido #${pedidoAEditar.id_pedido} editado con éxito.`, "success");
    } catch (err) { 
      mostrarToast("Error al editar el pedido.", "error"); 
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
      <div style={{ textAlign: 'center', padding: '100px 20px', fontFamily: 'var(--font-sans)', color: 'var(--text-dark)', fontWeight: '600' }}>
        Cargando información de MilkChain...
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
          <span className="split-image-badge" style={{ marginBottom: "12px" }}>
            <FiAward style={{ marginRight: "4px", verticalAlign: "middle" }} /> 
            {esAdmin ? "Consola de Administración" : "Lácteos Artesanales"}
          </span>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "2.2rem", color: "var(--text-dark)", marginBottom: "8px" }}>
            {esAdmin ? "Panel de Gestión de Pedidos" : "Mis Pedidos"}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "6px" }}>
            <FiUser style={{ color: "var(--color-caramel)" }} />
            <span>Conectado como: <strong>{user?.nombre} {user?.apellido || ""}</strong></span>
            <span style={{
              backgroundColor: "var(--color-caramel-light)",
              color: "var(--color-caramel)",
              fontSize: "0.75rem",
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: "10px",
              textTransform: "uppercase"
            }}>
              {esAdmin ? "Administrador" : "Cliente"}
            </span>
          </p>
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
                            <button 
                              onClick={() => setPedidoAEditar({ ...p, id_estado: mapaEstados[p.estado] || 1 })} 
                              className="btn-green"
                              style={{ 
                                padding: "8px 14px", 
                                fontSize: "0.85rem", 
                                backgroundColor: "#F39C12", 
                                boxShadow: "none" 
                              }}
                            >
                              <FiEdit2 /> Editar
                            </button>
                            <button 
                              onClick={() => cambiarEstado(p.id_pedido, p.estado)} 
                              className="btn-green"
                              style={{ 
                                padding: "8px 14px", 
                                fontSize: "0.85rem", 
                                backgroundColor: "#3498DB", 
                                boxShadow: "none" 
                              }}
                            >
                              <FiTrendingUp /> Estado
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
          <div style={{...modalContentStyle, width: "600px"}} className="print-container">
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

            <div style={{ marginTop: "35px" }} className="no-print">
              <button 
                onClick={imprimirFactura} 
                className="btn-green"
                style={{ width: "100%", padding: "12px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
              >
                <FiPrinter /> Imprimir Factura
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR (Solo Admin) */}
      {pedidoAEditar && (
        <div style={modalOverlayStyle}>
          <form onSubmit={guardarEdicion} style={modalContentStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
              <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.5rem", color: "var(--text-dark)", margin: 0 }}>
                Editar Pedido #{pedidoAEditar.id_pedido}
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
                  Monto Total ($):
                </label>
                <div style={{ position: "relative" }}>
                  <FiDollarSign style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
                  <input 
                    style={{ paddingLeft: "34px", width: "100%" }} 
                    type="number" 
                    step="0.01" 
                    value={pedidoAEditar.total || ''} 
                    onChange={e => setPedidoAEditar({...pedidoAEditar, total: e.target.value})} 
                    required
                  />
                </div>
              </div>
              
              <div>
                <label style={{ fontWeight: "700", fontSize: "0.9rem", color: "var(--text-dark)", display: "block", marginBottom: "6px" }}>
                  Estado del Pedido:
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
                      backgroundColor: "white", 
                      outline: "none" 
                    }} 
                    value={pedidoAEditar.id_estado} 
                    onChange={e => setPedidoAEditar({...pedidoAEditar, id_estado: Number(e.target.value)})}
                  >
                    <option value={1}>Pendiente</option>
                    <option value={2}>Preparación</option>
                    <option value={3}>Enviado</option>
                    <option value={4}>En camino</option>
                    <option value={5}>Entregado</option>
                    <option value={6}>Cancelado</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "35px" }}>
              <button type="submit" className="btn-green" style={{ flex: 1, padding: "12px" }}>
                Guardar
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
  padding: "40px", 
  borderRadius: "var(--radius-md)", 
  width: "480px", 
  boxShadow: "var(--shadow-lg)",
  border: "1px solid var(--border-color)",
  maxHeight: "90vh",
  overflowY: "auto"
};

>>>>>>> Rama_Front
export default PedidoPagina;