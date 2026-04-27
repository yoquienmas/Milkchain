import React, { useState, useEffect } from 'react'; // ← useEffect agregado
import { useCart } from '../context/useCart.jsx';
import { usePayment } from '../context/usePayment.jsx';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // ← Importante para la petición

const Checkout = () => {
  const { cart } = useCart();
  const { createOrder, loading } = usePayment();
  const navigate = useNavigate();
  
  // Estados originales
  const [error, setError] = useState('');
  
  // --- NUEVOS ESTADOS PARA DIRECCIONES ---
  const [direcciones, setDirecciones] = useState([]);
  const [direccionSeleccionada, setDireccionSeleccionada] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [user] = useState(JSON.parse(localStorage.getItem('user')) || null); // Asumiendo que guardas el user en localStorage

  // --- EFECTO PARA BUSCAR DIRECCIONES ---
  useEffect(() => {
    const fetchDirecciones = async () => {
      if (!user) return;
      try {
        const res = await axios.get(`/api/direcciones/${user.id || user._id}`);
        setDirecciones(res.data);
        if (res.data.length === 0) {
          setMostrarForm(true);
        } else {
          // Seleccionar la primera por defecto si existen
          setDireccionSeleccionada(res.data[0]);
        }
      } catch (err) {
        console.error("Error al obtener direcciones", err);
      }
    };
    fetchDirecciones();
  }, [user]);

  const handlePayment = async () => {
    try {
      setError('');
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Debes iniciar sesión para realizar el pago');
        navigate('/login');
        return;
      }

      // Validación de dirección
      if (!direccionSeleccionada) {
        setError('Por favor, selecciona o agrega una dirección de envío');
        return;
      }

      // Crear la orden de pago (puedes pasar la dirección aquí si tu backend la requiere)
      const orderData = await createOrder({
        ...cart,
        shippingAddress: direccionSeleccionada
      });
      
      if (orderData.url) {
        window.location.href = orderData.url;
      }
    } catch (error) {
      setError('Error al procesar el pago. Intenta nuevamente.');
      console.error('Payment error:', error);
    }
  };

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="checkout-empty text-center">
        <h2>No hay items en el carrito</h2>
        <button className="btn btn-primary mt-3" onClick={() => navigate('/catalogue')}>
          Continuar Comprando
        </button>
      </div>
    );
  }

  return (
    <div className="checkout">
      <h2>Finalizar Compra</h2>
      
      <div className="row">
        <div className="col-md-6">
          {/* SECCIÓN DE DIRECCIONES AGREGADA */}
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h3>Dirección de Envío</h3>
              <button 
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setMostrarForm(!mostrarForm)}
              >
                {mostrarForm ? 'Cancelar' : 'Agregar Nueva'}
              </button>
            </div>
            <div className="card-body">
              {direcciones.length > 0 ? (
                <select 
                  className="form-select mb-3"
                  onChange={(e) => setDireccionSeleccionada(direcciones.find(d => d._id === e.target.value))}
                >
                  {direcciones.map(dir => (
                    <option key={dir._id} value={dir._id}>
                      {dir.calle} {dir.numero}, {dir.ciudad}
                    </option>
                  ))}
                </select>
              ) : (
                !mostrarForm && <p className="text-warning">No tienes direcciones registradas.</p>
              )}

              {mostrarForm && (
                <div className="alert alert-info">
                  {/* Aquí iría tu componente de formulario <DireccionForm /> */}
                  <p>Formulario de dirección activo (debes implementarlo o redirigir)</p>
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3>Resumen del Pedido</h3>
            </div>
            <div className="card-body">
              {cart.items.map(item => (
                <div key={item.product?._id || item._id} className="d-flex justify-content-between mb-2">
                  <span>{item.product?.name || item.name} x {item.quantity}</span>
                  <span>${((item.product?.price || item.price || 0) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <hr />
              <div className="d-flex justify-content-between">
                <strong>Total:</strong>
                <strong>${(cart.total || 0).toFixed(2)}</strong>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h3>Método de Pago</h3>
            </div>
            <div className="card-body">
              <div className="payment-methods">
                <div className="form-check">
                  <input className="form-check-input" type="radio" id="mock-payment" name="payment" defaultChecked />
                  <label className="form-check-label" htmlFor="mock-payment">
                    Pago Simulado (Demo)
                  </label>
                </div>
                <p className="text-muted mt-2">
                  Esta es una simulación de pago. No se realizará ningún cargo real.
                </p>
              </div>

              {error && <div className="alert alert-danger mt-3">{error}</div>}

              <button
                className="btn btn-success w-100 mt-3"
                onClick={handlePayment}
                disabled={loading || (direcciones.length === 0 && !direccionSeleccionada)}
              >
                {loading ? 'Procesando...' : 'Pagar Ahora'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;