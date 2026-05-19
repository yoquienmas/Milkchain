import { useState, useEffect } from "react";
import { useCart } from "../context/ContextoCarrito.jsx"; // Asegúrate que el archivo se llame así
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/ContextoAutenticacion.jsx";
import axios from "axios";

function CarritoPagina() {
  const { user } = useAuth();
  const navigate = useNavigate();
const { cart, eliminar_producto_carrito, actualizarCantidad, total, vaciarCarrito } = useCart();  
  const [paso, setPaso] = useState(1);
  const [compraExitosa, setCompraExitosa] = useState(false);
  const [direccionGuardada, setDireccionGuardada] = useState(null);
  const [loading, setLoading] = useState(true);
  const [direccionSeleccionada, setDireccionSeleccionada] = useState(true);

  // ESTADOS PARA DATOS DESDE LA API
  const [mediosPago, setMediosPago] = useState([]);
  const [pagoSeleccionado, setPagoSeleccionado] = useState("");
  const [paises, setPaises] = useState([]);
  const [provincias, setProvincias] = useState([]);
  const [localidades, setLocalidades] = useState([]);

  const [formData, setFormData] = useState({
    calle: "", numero: "", telefono: "", id_pais: "", id_provincia: "", id_localidad: ""
  });

  // CARGA INICIAL DE DATOS
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      if (!user) return; // Si no hay usuario, no cargamos nada todavía

      try {
        setLoading(true);
        // Enviamos el ID del usuario logueado como parámetro en la URL
        const [resPaises, resDir, resPagos] = await Promise.allSettled([
          axios.get("http://localhost:3000/api/paises"),
          axios.get(`http://localhost:3000/api/direcciones/${user.id}`), // <--- CAMBIO AQUÍ
          axios.get("http://localhost:3000/api/pagos") 
        ]);
        if (resPaises.status === "fulfilled") {
          const rawData = resPaises.value.data;
          setPaises(Array.isArray(rawData) ? rawData : (rawData.data || []));
        }

        if (resPagos.status === "fulfilled") {
          setMediosPago(resPagos.value.data);
          if (resPagos.value.data.length > 0) setPagoSeleccionado(resPagos.value.data[0].id);
        }

        if (resDir.status === "fulfilled") {
          const data = resDir.value.data;
          const listaDir = Array.isArray(data) ? data : (data.data || []);
          if (Array.isArray(data) && data.length > 0) {
    const dir = data[0];
    setDireccionGuardada({
      id: dir.id_direccion,
      calle: dir.calle,
      numero: dir.numero,
      telefono: dir.n_contacto || dir.id_telefono,
      nombre_localidad: "Dirección principal"
    });
  } else {
    // SI NO HAY DATOS, ASEGURAMOS QUE SEA NULL
    setDireccionGuardada(null);
  }
        }
      } catch (error) {
        console.error("Error en carga inicial:", error);
      } finally {
        setLoading(false);
      }
    };
    cargarDatosIniciales();
  }, [user]);

  // HANDLERS PARA FORMULARIO
  const manejarPaisCambio = async (e) => {
    const paisId = e.target.value;
    setFormData({ ...formData, id_pais: paisId, id_provincia: "", id_localidad: "" });
    if (paisId) {
      try {
        const res = await axios.get(`http://localhost:3000/api/provincias/${paisId}`);
        setProvincias(Array.isArray(res.data) ? res.data : []);
      } catch (err) { console.error(err); }
    }
  };

  const manejarProvinciaCambio = async (e) => {
    const provId = e.target.value;
    setFormData({ ...formData, id_provincia: provId, id_localidad: "" });
    if (provId) {
      try {
        const res = await axios.get(`http://localhost:3000/api/localidades/${provId}`);
        setLocalidades(Array.isArray(res.data) ? res.data : []);
      } catch (err) { console.error(err); }
    }
  };

  const manejarChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const guardarNuevaDireccion = async (e) => {
    e.preventDefault();
    try {
      // Agregamos el id_usuario explícitamente aquí por si acaso
      const datosAEnviar = { ...formData, id_usuario: user.id }; 
      
      const res = await axios.post("http://localhost:3000/api/direcciones", datosAEnviar);
      
      setDireccionGuardada({ 
        id: res.data.id, 
        ...formData,
        nombre_localidad: "Dirección guardada" 
      });
      alert("¡Dirección guardada!");
    } catch (err) { 
      console.error(err);
      alert("Error al guardar: " + err.message); 
    }
};

const finalizarCompra = async () => {
    // 1. Verificación de seguridad
    if (!pagoSeleccionado) return alert("Por favor, selecciona un medio de pago");
    if (!user) return alert("Debes iniciar sesión para comprar");
    
    try {
      setLoading(true);
      
      const pedidoData = {
        id_usuario: user.id, 
        id_direccion: direccionGuardada.id,
        id_pago: pagoSeleccionado,
        total: total,
        detalles: cart
      };

      const response = await axios.post("http://localhost:3000/api/pedidos", pedidoData);
      
      if (response.status === 201) {
        // Esta función debe existir en tu contexto (ver paso 2)
        vaciarCarrito(); 
        setCompraExitosa(true);
      }
    } catch (error) {
      console.error("Error al finalizar pedido:", error);
      alert("Hubo un error al registrar tu pedido: " + (error.response?.data?.error || error.message));
    } finally { 
      setLoading(false); 
    }
};

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Cargando MilkChain...</div>;

  return (
    <div className="cart-container" style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', minHeight: '80vh' }}>
      
      {/* Indicador de Pasos Visual */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', borderBottom: '2px solid #eee', paddingBottom: '20px' }}>
        <span style={{ fontWeight: paso === 1 ? 'bold' : 'normal', color: paso === 1 ? '#4CAF50' : '#999' }}>1. Carrito</span>
        <span style={{ fontWeight: paso === 2 ? 'bold' : 'normal', color: paso === 2 ? '#4CAF50' : '#999' }}>2. Envío</span>
        <span style={{ fontWeight: paso === 3 ? 'bold' : 'normal', color: paso === 3 ? '#4CAF50' : '#999' }}>3. Pago</span>
      </div>

      {cart.length === 0 && !compraExitosa ? (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <p>Tu carrito está vacío.</p>
          <button onClick={() => navigate("/catalogue")} className="btn-green-main">Ir al catálogo</button>
        </div>
      ) : (
        <>
          {/* PASO 1: REVISAR CARRITO */}
          {paso === 1 && (
            <div className="step-animation">
              <h2>Tu Pedido</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Producto</th>
                    <th>Precio</th>
                    <th>Cantidad</th>
                    <th>Subtotal</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
{cart.map((item) => {
  const itemId = item.id_producto || item.id; // Aseguramos capturar el ID correcto
  return (
    <tr key={itemId} style={{ borderBottom: '1px solid #eee', textAlign: 'center' }}>
      <td style={{ padding: '15px', textAlign: 'left' }}>{item.nombre}</td>
      <td>${Number(item.precio).toFixed(2)}</td>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          {/* Usamos itemId aquí */}
          <button onClick={() => actualizarCantidad(itemId, item.cantidad - 1)} style={btnMiniStyle}>-</button>
          <span>{item.cantidad}</span>
          <button onClick={() => actualizarCantidad(itemId, item.cantidad + 1)} style={btnMiniStyle}>+</button>
        </div>
      </td>
      <td>${(item.precio * item.cantidad).toFixed(2)}</td>
      <td>
        <button onClick={() => eliminar_producto_carrito(itemId)} style={{ color: '#ff5252', border: 'none', background: 'none', cursor: 'pointer' }}>✕</button>
      </td>
    </tr>
  );
})}
                </tbody>
              </table>
                  {/* SECCIÓN DE BOTONES INFERIORES */}
    <div style={{ marginTop: '20px' }}>
      <h3 style={{ fontSize: '1.5rem', textAlign: 'right' }}>Total: ${total.toFixed(2)}</h3>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', // Esto separa los botones a los extremos
        alignItems: 'center', 
        marginTop: '20px' 
      }}>
        {/* Botón Nuevo: Volver al catálogo (Izquierda) */}
        <button 
          onClick={() => navigate("/ver_catalogo")} 
          style={{
            background: 'none',
            border: '1px solid #4CAF50',
            color: '#4CAF50',
            padding: '12px 25px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          ← Volver al catálogo
        </button>

        {/* Botón Existente: Continuar (Derecha) */}
        <button 
          onClick={() => setPaso(2)} 
          className="btn-green-main"
        >
          Continuar al Envío →
        </button>
      </div>
    </div>
  </div>
)}


          {/* PASO 2: ENVÍO */}
          {paso === 2 && (
            <div className="step-animation">
              {!direccionGuardada ? (
                <div style={{ maxWidth: '500px', margin: '0 auto' }}>
                  <h3>Datos de Envío</h3>
                  <form onSubmit={guardarNuevaDireccion}>
                    <input name="calle" placeholder="Calle" style={inputStyle} onChange={manejarChange} required />
                    <input name="numero" type="number" placeholder="Número" style={inputStyle} onChange={manejarChange} required />
                    <input name="telefono" placeholder="Teléfono de contacto" style={inputStyle} onChange={manejarChange} required />
                    
                    <select name="id_pais" style={inputStyle} onChange={manejarPaisCambio} required value={formData.id_pais}>
                      <option value="">Seleccione un País...</option>
                      {paises.map(p => <option key={p.id || p.ID} value={p.id || p.ID}>{p.nombre || p.Nombre}</option>)}
                    </select>

                    <select name="id_provincia" style={inputStyle} onChange={manejarProvinciaCambio} required disabled={!formData.id_pais}>
                      <option value="">Seleccione una Provincia...</option>
                      {provincias.map(prov => <option key={prov.id || prov.ID} value={prov.id || prov.ID}>{prov.nombre || prov.Nombre}</option>)}
                    </select>

                    <select name="id_localidad" style={inputStyle} onChange={manejarCambio} required disabled={!formData.id_provincia}>
                      <option value="">Seleccione una Localidad...</option>
                      {localidades.map(loc => <option key={loc.id || loc.ID} value={loc.id || loc.ID}>{loc.nombre || loc.Nombre}</option>)}
                    </select>

                    <button type="submit" className="btn-green-main" style={{ width: '100%' }}>Guardar dirección</button>
                  </form>
                </div>
              ) : (
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                  <h2>Confirmar dirección:</h2>
                  <div style={{ padding: '20px', border: '2px solid #248a4d', borderRadius: '12px', backgroundColor: '#f0fdf4', marginBottom: '20px' }}>
                    <p><strong>{direccionGuardada.calle} {direccionGuardada.numero}</strong></p>
                    <p>Tel: {direccionGuardada.telefono}</p>
                  </div>
                  <button className="btn-green-main" style={{ width: '100%' }} onClick={() => setPaso(3)}>Continuar al pago →</button>
                  <button onClick={() => setDireccionGuardada(null)} style={{ background: 'none', border: 'none', color: '#666', textDecoration: 'underline', width: '100%', marginTop: '10px', cursor: 'pointer' }}>Usar otra dirección</button>
                </div>
              )}
            </div>
          )}

          {/* PASO 3: PAGO */}
{paso === 3 && (
  <div className="step-animation">
    {compraExitosa ? (
      <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f8fdf9', borderRadius: '15px' }}>
        <h2 style={{ color: '#248a4d', fontSize: '2rem' }}>✓ ¡Pago exitoso!</h2>
        <p style={{ fontSize: '1.2rem', marginBottom: '30px' }}>Envío en preparación</p>
        
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          {/* Botón Ver Pedido */}
          <button 
            onClick={() => navigate("/mis-pedidos")} 
            style={{ 
              backgroundColor: '#4CAF50', color: 'white', padding: '12px 25px', 
              border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' 
            }}
          >
            Ver pedido
          </button>

          {/* Botón Imprimir Factura */}
          <button 
            onClick={() => window.print()} // Esto abre la ventana de impresión/PDF del navegador
            style={{ 
              backgroundColor: '#333', color: 'white', padding: '12px 25px', 
              border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' 
            }}
          >
            Imprimir factura
          </button>
        </div>
      </div>
    ) : (
               <div style={{ textAlign: 'center' }}>
        <h2>Medio de Pago</h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center', margin: '20px 0' }}>
                    {mediosPago.map((metodo) => (
                      <div 
                        key={metodo.id} 
                        onClick={() => setPagoSeleccionado(metodo.id)}
                        style={{ 
                          padding: '15px 30px', borderRadius: '10px', cursor: 'pointer',
                          border: pagoSeleccionado === metodo.id ? '2px solid #248a4d' : '1px solid #ddd',
                          backgroundColor: pagoSeleccionado === metodo.id ? '#f0fdf4' : 'white'
                        }}
                      >
                        {metodo.nombre}
                      </div>
                    ))}
                  </div>
                  <button onClick={finalizarCompra} className="btn-green-confirm">Confirmar y Finalizar</button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      <style>{`
        .btn-green-main { background-color: #4CAF50; color: white; padding: 12px 25px; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; }
        .btn-green-confirm { background-color: #248a4d; color: white; padding: 15px 40px; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 1.1rem; }
        .step-animation { animation: fadeIn 0.3s ease-in; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

const inputStyle = { padding: '12px', borderRadius: '5px', border: '1px solid #ddd', width: '100%', marginBottom: '15px', boxSizing: 'border-box' };
const btnMiniStyle = { width: '30px', height: '30px', borderRadius: '50%', border: '1px solid #ddd', cursor: 'pointer', backgroundColor: 'white' };

export default CarritoPagina;