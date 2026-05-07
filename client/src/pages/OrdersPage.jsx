import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function OrdersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para modales y flujos de Admin
  const [pedidoAEliminar, setPedidoAEliminar] = useState(null);
  const [pedidoAEditar, setPedidoAEditar] = useState(null);
  const [detalleSeleccionado, setDetalleSeleccionado] = useState(null);

const esAdmin = 
  user?.rol === "Administrador" || 
  Number(user?.id_rol) === 1 || 
  Number(user?.id_Rol) === 1;

// Para depurar, añade este console.log temporalmente:
console.log("ID del usuario:", user?.id || user?.id_usuario || "NO HAY ID");
console.log("¿Es Administrador?:", esAdmin);
  const fetchPedidos = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // 1. Definimos las variables PRIMERO
      const userId = user?.id || user?.id_usuario;
      
      const isAdminUser = 
        user?.rol === "Administrador" || 
        Number(user?.id_rol) === 1 || 
        Number(user?.id_Rol) === 1;

      // 2. Definimos la URL una sola vez
      const url = isAdminUser 
        ? "http://localhost:3000/api/pedidos/all" 
        : `http://localhost:3000/api/pedidos/${userId}`;

      console.log("Pidiendo pedidos con rol Admin:", isAdminUser);
      console.log("URL final de la petición:", url);

      // 3. Hacemos la petición
      const res = await axios.get(url);
      setPedidos(res.data);

    } catch (err) {
      console.error("Error al cargar pedidos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchPedidos();
  }, [user, esAdmin]);

  // --- 7.8 Cambiar Estado de Pedido (Admin) ---
  const cambiarEstadoDirecto = async (id, nuevoEstado) => {
    try {
      await axios.patch(`http://localhost:3000/api/pedidos/estado/${id}`, { nuevoEstado });
      fetchPedidos();
    } catch (err) {
      alert("No se pudo actualizar el estado");
    }
  };

  // --- 7.7 Editar Pedido (Admin) ---
  const guardarEdicion = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:3000/api/pedidos/${pedidoAEditar.id}`, pedidoAEditar);
      setPedidoAEditar(null);
      fetchPedidos();
    } catch (err) {
      alert("Error al editar pedido: Campos no válidos");
    }
  };

  // --- 7.6 Eliminar Pedido (Admin) ---
  const ejecutarEliminacion = async () => {
    try {
      await axios.delete(`http://localhost:3000/api/pedidos/${pedidoAEliminar.id}`);
      setPedidoAEliminar(null);
      fetchPedidos();
    } catch (err) {
      alert("Error al eliminar");
    }
  };

  // --- "Ver pedido" / Detalles ---
  const verDetalle = async (idPedido) => {
    try {
      const res = await axios.get(`http://localhost:3000/api/pedidos/detalle/${idPedido}`);
      setDetalleSeleccionado({ id: idPedido, productos: res.data });
    } catch (err) {
      alert("No se pudo cargar el detalle");
    }
  };

  const imprimirFactura = () => window.print();

  if (loading) return <div style={{ textAlign: "center", padding: "50px" }}>Cargando información de MilkChain...</div>;

  return (
    <div style={{ padding: "40px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ color: "#248a4d" }}>{esAdmin ? "Panel de Gestión (Administrador)" : "Mis Pedidos"}</h1>
      <p>Usuario: <strong>{user?.nombre}</strong></p>
      <hr />

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr style={{ background: "#f4f4f4" }}>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>Fecha</th>
            <th style={thStyle}>Total</th>
            <th style={thStyle}>Estado</th>
            <th style={thStyle}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map((p) => (
           <tr key={p.id_pedido}>
              <td>#{p.id_pedido}</td>
              <td style={tdStyle}>{new Date(p.fecha).toLocaleDateString()}</td>
              <td style={tdStyle}>${Number(p.total).toFixed(2)}</td>
              <td style={tdStyle}>
                {esAdmin ? (
                  <select 
                    value={p.estado} 
                    onChange={(e) => cambiarEstadoDirecto(p.id, e.target.value)}
                    style={{ padding: "5px", borderRadius: "4px" }}
                  >
                    <option value="Preparación">Preparación</option>
                    <option value="En camino">En camino</option>
                    <option value="Entregado">Entregado</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                ) : (
                  <span>{p.estado}</span>
                )}
              </td>
              <td style={tdStyle}>
                <button onClick={() => verDetalle(p.id_pedido)} style={btnDetailStyle}>Detalles</button>
                {esAdmin && (
                  <button onClick={() => setPedidoAEliminar(p)} style={{ ...btnAdminStyle, background: "#e57373", marginLeft: "10px" }}>
                    Eliminar
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 7.6 MODAL CONFIRMACIÓN ELIMINAR */}
      {pedidoAEliminar && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3>¿Eliminar pedido #{pedidoAEliminar.id}?</h3>
            <p>Esta acción no se puede deshacer.</p>
            <button onClick={ejecutarEliminacion} style={{ ...btnConfirmStyle, background: "red" }}>Confirmar Eliminar</button>
            <button onClick={() => setPedidoAEliminar(null)} style={btnCancelStyle}>Cancelar</button>
          </div>
        </div>
      )}

      {/* 7.7 MODAL DETALLES Y FACTURA */}
      {detalleSeleccionado && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h2>Pedido #{detalleSeleccionado.id}</h2>
            {detalleSeleccionado.productos.map((prod, i) => (
              <p key={i}>{prod.nombre} x {prod.cantidad} - ${prod.precio_unitario}</p>
            ))}
            <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
              <button onClick={imprimirFactura} style={btnConfirmStyle}>Imprimir Factura</button>
              {esAdmin && (
                <button 
                  onClick={() => {
                    setPedidoAEditar(pedidos.find(p => p.id === detalleSeleccionado.id));
                    setDetalleSeleccionado(null);
                  }}
                  style={{ ...btnConfirmStyle, background: "#ffb74d" }}
                >
                  Editar Datos
                </button>
              )}
              <button onClick={() => setDetalleSeleccionado(null)} style={btnCancelStyle}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR FORMULARIO */}
      {pedidoAEditar && (
        <div style={modalOverlayStyle}>
          <form onSubmit={guardarEdicion} style={modalContentStyle}>
            <h3>Editar Datos Pedido #{pedidoAEditar.id}</h3>
            <label>Total:</label>
            <input 
              type="number" 
              step="0.01" 
              value={pedidoAEditar.total} 
              onChange={(e) => setPedidoAEditar({ ...pedidoAEditar, total: e.target.value })} 
              required
            />
            <div style={{ marginTop: "20px" }}>
              <button type="submit" style={btnConfirmStyle}>Guardar</button>
              <button type="button" onClick={() => setPedidoAEditar(null)} style={btnCancelStyle}>Cancelar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// Estilos rápidos
const thStyle = { padding: "12px", textAlign: "left", borderBottom: "2px solid #ddd" };
const tdStyle = { padding: "12px" };
const btnDetailStyle = { padding: "8px 12px", cursor: "pointer", background: "#248a4d", color: "white", border: "none", borderRadius: "4px" };
const btnAdminStyle = { padding: "8px 12px", cursor: "pointer", color: "white", border: "none", borderRadius: "4px" };
const modalOverlayStyle = { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center" };
const modalContentStyle = { background: "white", padding: "30px", borderRadius: "10px", width: "400px" };
const btnConfirmStyle = { padding: "10px", cursor: "pointer", border: "none", color: "white", borderRadius: "5px", marginRight: "10px" };
const btnCancelStyle = { padding: "10px", cursor: "pointer", border: "none", borderRadius: "5px" };

export default OrdersPage;