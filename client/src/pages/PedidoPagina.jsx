import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/ContextoAutenticacion.jsx";
import { useNavigate } from "react-router-dom";

function PedidoPagina() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para modales
  const [pedidoAEditar, setPedidoAEditar] = useState(null);
  const [detalleSeleccionado, setDetalleSeleccionado] = useState(null);

  /**
   * AJUSTE DE ROL SEGÚN BASE DE DATOS:
   * Basado en tu tabla `rol`: 
   * 1 = Administrador
   * 2 = Cliente
   */
const esAdmin = user?.id_rol === 1 || user?.idRol === 1 || user?.rol === 1 || user?.nombre === 'admin';

 const fetchPedidos = async () => {
    try {
        setLoading(true);
        // Usar axios directamente con la URL completa para evitar errores de contexto
        const res = await axios.get("http://localhost:3000/api/pedidos/all", { withCredentials: true });
        console.log("Data que llegó al admin:", res.data); // <--- MIRA ESTO EN CONSOLA
        setPedidos(res.data);
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
};

 useEffect(() => {
    if (user) { 
        fetchPedidos();
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
        fetchPedidos();
      } catch (err) { alert("Error al eliminar"); }
    }
  };

  const cambiarEstado = async (id, estadoActual) => {
    const estados = ["Pendiente", "Enviado", "Entregado", "Cancelado"];
    let siguiente = estados[(estados.indexOf(estadoActual) + 1) % estados.length];
    
    try {
      await axios.patch(`http://localhost:3000/api/pedidos/estado/${id}`, { nuevoEstado: siguiente });
      fetchPedidos();
    } catch (err) { alert("Error al cambiar estado"); }
  };

 const guardarEdicion = async (e) => {
    e.preventDefault();
    try {
        // Asegúrate de enviar p.id_pedido y no solo p.id
        await axios.put(`http://localhost:3000/api/pedidos/${pedidoAEditar.id_pedido}`, pedidoAEditar);
        setPedidoAEditar(null);
        fetchPedidos();
    } catch (err) { alert("Error al editar pedido"); }
};

  const imprimirFactura = () => {
    window.print();
  };
if (!user) {
    return <p>Cargando datos de usuario...</p>;
}
  if (loading) return <div style={{ textAlign: "center", padding: "50px" }}>Cargando información de MilkChain...</div>;
console.log("DEBUG - Usuario completo:", user);
console.log("DEBUG - ID Rol:", user?.id_rol);
console.log("DEBUG - Tipo de dato de id_rol:", typeof user?.id_rol);
  return (
    <div style={{ padding: "40px", maxWidth: "1100px", margin: "0 auto", minHeight: "80vh" }}>
      <h1 style={{ color: "#248a4d" }}>
        {esAdmin ? "Panel de Gestión (Administrador)" : "Mis Pedidos"}
      </h1>
      <p style={{ color: "#666" }}>
        Conectado como: <strong>{user?.nombre || "Usuario"}</strong> ({esAdmin ? "Admin" : "Cliente"})
      </p>
      <hr />
      
      {pedidos.length === 0 ? (
        <p style={{ marginTop: "20px" }}>No hay pedidos para mostrar en este momento.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px", backgroundColor: "white", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
          <thead>
            <tr style={{ background: "#f8f9fa", borderBottom: "2px solid #dee2e6" }}>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Fecha</th>
              {esAdmin && <th style={thStyle}>Cliente</th>}
              <th style={thStyle}>Total</th>
              <th style={thStyle}>Estado</th>
              <th style={thStyle}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map(p => (
  <tr key={p.id_pedido} style={{ borderBottom: "1px solid #eee" }}>
    <td style={tdStyle}>#{p.id_pedido}</td>
    <td style={tdStyle}>{new Date(p.fecha).toLocaleDateString()}</td>
    {esAdmin && <td style={tdStyle}>{p.nombre_usuario || p.idUsuario}</td>}
    
    {/* CAMBIO AQUÍ: probamos 'p.total' o 'p.Total' */}
    <td style={tdStyle}>
        <strong>${Number(p.total || p.Total || 0).toFixed(2)}</strong>
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
                    {p.estado}
                  </span>
                </td>
                <td style={tdStyle}>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
<button onClick={() => verDetalle(p.id_pedido)} style={btnDetailStyle}>
        Ver Detalles
    </button>
                    {/* BOTONES EXCLUSIVOS DE ADMIN */}
    {user && (user.id_rol == 1 || user.rol === 'Administrador') && (
        <>
            <button 
                onClick={() => setPedidoAEditar(p)} 
                className="btn-edit" 
                style={{ marginLeft: '5px', backgroundColor: '#ffc107' }}
            >
                Editar
            </button>
            <button 
                onClick={() => cambiarEstado(p.id_pedido, p.estado)} 
                className="btn-status"
                style={{ marginLeft: '5px', backgroundColor: '#17a2b8' }}
            >
                Siguiente Estado
            </button>
            <button 
                onClick={() => eliminarPedido(p.id_pedido)} 
                className="btn-delete"
                style={{ marginLeft: '5px', backgroundColor: '#dc3545' }}
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

      {/* MODAL DE DETALLE / FACTURA */}
     {detalleSeleccionado && (
  <div style={modalOverlayStyle}>
    <div style={{...modalContentStyle, width: "600px"}} className="print-container">
      <div className="no-print" style={{textAlign: 'right'}}>
          <button onClick={() => setDetalleSeleccionado(null)}>✕</button>
      </div>
      
      {/* Encabezado de Factura */}
      <div style={{borderBottom: '2px solid #248a4d', marginBottom: '20px'}}>
        <h2 style={{ color: "#248a4d" }}>MilkChain - Comprobante</h2>
        <p><strong>Pedido:</strong> #{detalleSeleccionado.id}</p>
        <p><strong>Fecha:</strong> {new Date(detalleSeleccionado.productos[0]?.fecha).toLocaleDateString()}</p>
        <p><strong>Cliente:</strong> {detalleSeleccionado.productos[0]?.nombre_cliente}</p>
      </div>

      {/* Tabla de Productos */}
      <table style={{width: '100%', marginBottom: '20px'}}>
        <thead>
          <tr style={{borderBottom: '1px solid #ddd'}}>
            <th style={{textAlign: 'left'}}>Producto</th>
            <th>Cant.</th>
            <th>Precio</th>
            <th>Subtotal</th>
          </tr>
        </thead>
        {/* Dentro del modal, en el map de productos */}
<tbody>
  {detalleSeleccionado.productos.map((prod, index) => (
    <tr key={index}>
        <td>{prod.nombre}</td>
        <td style={{textAlign: 'center'}}>{prod.cantidad}</td>
        <td style={{textAlign: 'center'}}>${parseFloat(prod.precio_unitario || 0).toFixed(2)}</td>
        <td style={{textAlign: 'right'}}>${(parseFloat(prod.cantidad || 0) * parseFloat(prod.precio_unitario || 0)).toFixed(2)}</td>
    </tr>
))}
</tbody>
      </table>

      <div style={{textAlign: 'right', fontSize: '1.2rem', fontWeight: 'bold'}}>
Total: ${parseFloat(detalleSeleccionado.productos[0]?.total_pedido || 0).toFixed(2)}
</div>

      {/* Botones invisibles al imprimir */}
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
            <h3 style={{ marginBottom: "20px" }}>Editar Pedido #{pedidoAEditar.id}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "15px", textAlign: "left" }}>
                <label style={{ fontWeight: "bold" }}>Monto Total:</label>
                <input style={inputStyle} type="number" step="0.01" value={pedidoAEditar.total} onChange={e => setPedidoAEditar({...pedidoAEditar, total: e.target.value})} />
                
                <label style={{ fontWeight: "bold" }}>Estado del Pedido:</label>
                <select style={inputStyle} value={pedidoAEditar.estado} onChange={e => setPedidoAEditar({...pedidoAEditar, estado: e.target.value})}>
                    <option value="Pendiente">Pendiente</option>
                    <option value="Enviado">Enviado</option>
                    <option value="Entregado">Entregado</option>
                    <option value="Cancelado">Cancelado</option>
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

// Estilos de UI
const thStyle = { padding: "15px", textAlign: "left", color: "#4a5568", fontWeight: "600" };
const tdStyle = { padding: "15px", color: "#2d3748" };
const inputStyle = { padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e0", fontSize: "1rem" };
const btnDetailStyle = { background: "#6fb973", color: "white", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: "600", transition: "0.2s" };
const btnEditStyle = { color: "white", border: "none", padding: "8px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem", fontWeight: "bold" };
const btnNextStyle = { color: "white", border: "none", padding: "8px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem", fontWeight: "bold" };
const btnDeleteStyle = { color: "white", border: "none", padding: "8px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem", fontWeight: "bold" };
const modalOverlayStyle = { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.7)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, backdropFilter: "blur(2px)" };
const modalContentStyle = { background: "white", padding: "35px", borderRadius: "20px", width: "450px", textAlign: "center", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" };
const btnConfirmStyle = { flex: 1, padding: "12px", backgroundColor: "#248a4d", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" };
const btnCancelStyle = { flex: 1, padding: "12px", backgroundColor: "#edf2f7", color: "#4a5568", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" };

export default PedidoPagina;