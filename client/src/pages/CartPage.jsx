import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function CartPage() {
  const navigate = useNavigate();
  const { cart, eliminar_producto_carrito, actualizarCantidad, total } = useCart();
  
  const [paso, setPaso] = useState(1);
  const [compraExitosa, setCompraExitosa] = useState(false);
  const [direccionGuardada, setDireccionGuardada] = useState(null);
  const [loading, setLoading] = useState(true);
  const [direccionSeleccionada, setDireccionSeleccionada] = useState(true);

  // ESTADOS PARA PAGOS DINÁMICOS
  const [mediosPago, setMediosPago] = useState([]);
  const [pagoSeleccionado, setPagoSeleccionado] = useState("");

  const [paises, setPaises] = useState([]);
  const [provincias, setProvincias] = useState([]);
  const [localidades, setLocalidades] = useState([]);

  const [formData, setFormData] = useState({
    calle: "", numero: "", telefono: "", id_pais: "", id_provincia: "", id_localidad: ""
  });

  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        setLoading(true);
        const [resPaises, resDir, resPagos] = await Promise.allSettled([
          axios.get("http://localhost:3000/api/paises"),
          axios.get("http://localhost:3000/api/direcciones"),
          axios.get("http://localhost:3000/api/pagos") 
        ]);

        if (resPaises.status === "fulfilled") {
          const rawData = resPaises.value.data;
          setPaises(Array.isArray(rawData) ? rawData : (rawData.data || []));
        }

        if (resPagos.status === "fulfilled") {
          setMediosPago(resPagos.value.data);
          if (resPagos.value.data.length > 0) {
            setPagoSeleccionado(resPagos.value.data[0].id);
          }
        }

        if (resDir.status === "fulfilled") {
          const data = resDir.value.data;
          const listaDir = Array.isArray(data) ? data : (data.data || []);
          if (listaDir.length > 0) {
            const dir = listaDir[0];
            setDireccionGuardada({
              id: dir.id,
              calle: dir.calle,
              numero: dir.numero,
              telefono: dir.n_contacto,
              nombre_localidad: "Dirección principal"
            });
          }
        }
      } catch (error) {
        console.error("Error en carga inicial:", error);
      } finally {
        setLoading(false);
      }
    };
    cargarDatosIniciales();
  }, []);

  const handlePaisChange = async (e) => {
    const paisId = e.target.value;
    setFormData({ ...formData, id_pais: paisId, id_provincia: "", id_localidad: "" });
    if (paisId) {
      try {
        const res = await axios.get(`http://localhost:3000/api/provincias/${paisId}`);
        setProvincias(Array.isArray(res.data) ? res.data : []);
      } catch (err) { console.error(err); }
    }
  };

  const handleProvinciaChange = async (e) => {
    const provId = e.target.value;
    setFormData({ ...formData, id_provincia: provId, id_localidad: "" });
    if (provId) {
      try {
        const res = await axios.get(`http://localhost:3000/api/localidades/${provId}`);
        setLocalidades(Array.isArray(res.data) ? res.data : []);
      } catch (err) { console.error(err); }
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const guardarNuevaDireccion = async (e) => {
  e.preventDefault();
  try {
    const res = await axios.post("http://localhost:3000/api/direcciones", formData);
    
    // Sincronizamos los nombres de las propiedades con los que usas en el render
    setDireccionGuardada({ 
      id: res.data.id, 
      calle: formData.calle,
      numero: formData.numero,
      telefono: formData.telefono, // El valor que viene del input
      nombre_localidad: "Dirección recién guardada" 
    });
    
    alert("¡Dirección guardada!");
  } catch (err) { 
    alert("Error al guardar"); 
  }
};

  const finalizarCompra = async () => {
    if (!pagoSeleccionado) return alert("Por favor, selecciona un medio de pago");

    try {
      setLoading(true);
      const pedidoData = {
        id_usuario: 1, // ID temporal
        id_direccion: direccionGuardada.id,
        id_pago: pagoSeleccionado,
        total: total,
        detalles: cart
      };

      const response = await axios.post("http://localhost:3000/api/pedidos", pedidoData);

      if (response.status === 201) {
        setCompraExitosa(true);
      }
    } catch (error) {
      console.error("Error al procesar pedido:", error);
      alert("Hubo un error al registrar tu pedido.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Cargando MilkChain...</div>;

  return (
    <div className="cart-container" style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', minHeight: '80vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.8rem' }}>Mi Carrito</h1>
      </div>

      {cart.length === 0 && !compraExitosa ? (
        <div style={{ textAlign: 'center' }}>
          <p>Tu carrito está vacío.</p>
          <button onClick={() => navigate("/catalogue")} className="btn-green-main">Ir al catálogo</button>
        </div>
      ) : (
        <>
          {/* PASO 1: RESUMEN PRODUCTOS */}
          {paso === 1 && (
            <div className="step-animation">
              <h2>Tu Pedido</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white' }}>
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
  const currentId = item.id || item.id_producto; // Consistencia de ID
  return (
    <tr key={currentId} style={{ borderBottom: '1px solid #eee', textAlign: 'center' }}>
      <td style={{ padding: '15px', textAlign: 'left' }}>{item.nombre}</td>
      <td>${Number(item.precio).toFixed(2)}</td>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          {/* Usamos currentId aquí */}
          <button onClick={() => actualizarCantidad(currentId, item.cantidad - 1)} style={btnMiniStyle}>-</button>
          <span>{item.cantidad}</span>
          <button onClick={() => actualizarCantidad(currentId, item.cantidad + 1)} style={btnMiniStyle}>+</button>
        </div>
      </td>
      <td>${(item.precio * item.cantidad).toFixed(2)}</td>
      <td>
        <button onClick={() => eliminar_producto_carrito(currentId)} style={{ color: '#ff5252', border: 'none', background: 'none' }}>✕</button>
      </td>
    </tr>
  );
})}
                </tbody>
              </table>
              <div style={{ textAlign: 'right', marginTop: '20px' }}>
                <h3>Total: ${total.toFixed(2)}</h3>
                <button onClick={() => setPaso(2)} className="btn-green-main">Continuar al Envío →</button>
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
                    <label>Calle</label>
                    <input name="calle" type="text" style={inputStyle} onChange={handleChange} required />
                    <label>Número</label>
                    <input name="numero" type="number" style={inputStyle} onChange={handleChange} required />
                    <label>Teléfono</label>
                    <input name="telefono" type="text" style={inputStyle} onChange={handleChange} required />
                    
                    <label>País</label>
                    <select name="id_pais" style={inputStyle} onChange={handlePaisChange} required value={formData.id_pais}>
                      <option value="">Seleccione un País...</option>
                      {paises.map(p => <option key={p.id || p.ID} value={p.id || p.ID}>{p.nombre || p.Nombre}</option>)}
                    </select>

                    <label>Provincia</label>
                    <select name="id_provincia" style={inputStyle} onChange={handleProvinciaChange} required value={formData.id_provincia} disabled={!formData.id_pais}>
                      <option value="">Seleccione una Provincia...</option>
                      {provincias.map(prov => <option key={prov.id || prov.ID} value={prov.id || prov.ID}>{prov.nombre || prov.Nombre}</option>)}
                    </select>

                    <label>Localidad</label>
                    <select name="id_localidad" style={inputStyle} onChange={handleChange} required value={formData.id_localidad} disabled={!formData.id_provincia}>
                      <option value="">Seleccione una Localidad...</option>
                      {localidades.map(loc => <option key={loc.id || loc.ID} value={loc.id || loc.ID}>{loc.nombre || loc.Nombre}</option>)}
                    </select>

                    <div style={{ display: 'flex', gap: '10px' }}>
                       <button type="button" onClick={() => setPaso(1)} className="btn-outline" style={{flex: 1}}>Volver</button>
                       <button type="submit" className="btn-green-main" style={{flex: 2}}>Guardar dirección</button>
                    </div>
                  </form>
                </div>
              ) : (
                <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                  <h2>Selecciona una dirección de envío:</h2>
                  <div 
                    onClick={() => setDireccionSeleccionada(true)}
                    style={{ 
                      padding: '20px', 
                      border: direccionSeleccionada ? '2px solid #248a4d' : '1px solid #ddd', 
                      borderRadius: '12px', 
                      backgroundColor: direccionSeleccionada ? '#f0fdf4' : 'white',
                      display: 'flex', alignItems: 'center', cursor: 'pointer', marginBottom: '20px'
                    }}
                  >
                    <div style={{
                      width: '22px', height: '22px', borderRadius: '50%',
                      border: direccionSeleccionada ? '6px solid #248a4d' : '2px solid #ccc',
                      marginRight: '15px', backgroundColor: 'white'
                    }}></div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: 'bold' }}>{direccionGuardada.calle} {direccionGuardada.numero}</p>
                      <p style={{ margin: '5px 0 0', color: '#666' }}>{direccionGuardada.nombre_localidad}</p>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#888' }}>Tel: {direccionGuardada.telefono}</p>
                    </div>
                  </div>
                  <button className="btn-green-main" style={{ width: '100%' }} onClick={() => setPaso(3)}>Continuar al pago →</button>
                  <button onClick={() => setDireccionGuardada(null)} style={{ background: 'none', border: 'none', color: '#666', textDecoration: 'underline', width: '100%', marginTop: '15px', cursor: 'pointer' }}>+ Agregar otra dirección</button>
                </div>
              )}
            </div>
          )}

          {/* PASO 3: PAGO Y VISTA DE ÉXITO */}
          {paso === 3 && (
            <div className="step-animation">
              {compraExitosa ? (
                /* VISTA DE ÉXITO ACTUALIZADA */
                <div style={{ padding: '40px', backgroundColor: 'white', borderRadius: '15px', boxShadow: '0 8px 20px rgba(0,0,0,0.1)', maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
                    <div style={{ fontSize: '5rem', color: '#248a4d', marginBottom: '10px' }}>✓</div>
                    <h2 style={{ color: '#2c3e50', marginBottom: '10px' }}>Pago exitoso, envío en preparación</h2>
                    <p style={{ color: '#666', marginBottom: '30px' }}>Gracias por confiar en MilkChain.</p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <button onClick={() => navigate("/mis-pedidos")} className="btn-green-confirm" style={{ width: '100%' }}>
                            Ver pedido
                        </button>
                        <button onClick={() => window.print()} className="btn-outline" style={{ width: '100%', borderColor: '#248a4d', color: '#248a4d' }}>
                            Imprimir factura
                        </button>
                        <button onClick={() => navigate("/")} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', textDecoration: 'underline', marginTop: '10px' }}>
                            Volver al inicio
                        </button>
                    </div>
                </div>
              ) : (
                /* SELECTOR DE MEDIOS DE PAGO */
                <div style={{ textAlign: 'center' }}>
                  <h2>Selecciona tu Medio de Pago</h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center', margin: '30px 0' }}>
                    {mediosPago.map((metodo) => (
                      <div 
                        key={metodo.id}
                        className={`payment-card ${pagoSeleccionado === metodo.id ? 'active' : ''}`}
                        onClick={() => setPagoSeleccionado(metodo.id)}
                        style={{ 
                          cursor: 'pointer', minWidth: '220px', padding: '20px', borderRadius: '12px',
                          border: pagoSeleccionado === metodo.id ? '2px solid #248a4d' : '1px solid #ddd',
                          backgroundColor: pagoSeleccionado === metodo.id ? '#f0fdf4' : 'white',
                          display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s'
                        }}
                      >
                        <input type="radio" checked={pagoSeleccionado === metodo.id} readOnly />
                        <label style={{ margin: 0, cursor: 'pointer', fontWeight: 'bold' }}>{metodo.nombre}</label>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
                    <button onClick={() => setPaso(2)} className="btn-outline">Volver</button>
                    <button onClick={finalizarCompra} className="btn-green-confirm">Finalizar pedido</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      <style>{`
        .btn-green-main { background-color: #6fb973; color: white; padding: 12px 25px; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; }
        .btn-green-confirm { background-color: #248a4d; color: white; padding: 15px 40px; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; }
        .btn-outline { background: white; border: 1px solid #ccc; color: #666; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-weight: bold; }
        .step-animation { animation: fadeIn 0.3s ease-in; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

const inputStyle = { padding: '10px', borderRadius: '5px', border: '1px solid #ccc', width: '100%', marginBottom: '10px' };
const btnMiniStyle = { width: '30px', height: '30px', borderRadius: '50%', border: '1px solid #ddd', cursor: 'pointer' };

export default CartPage;