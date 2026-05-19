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

export default PedidoPagina;