import React, { useState } from 'react';
import { useCart } from '../context/useCart.jsx';
import { usePayment } from '../context/usePayment.jsx'; // ← Esta importación sigue igual
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
  const { cart } = useCart();
  const { createOrder, loading } = usePayment();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handlePayment = async () => {
    try {
      setError('');
      
      // Verificar que el usuario esté autenticado
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Debes iniciar sesión para realizar el pago');
        navigate('/login');
        return;
      }

      // Crear la orden de pago
      const orderData = await createOrder(cart);
      
      // Redirigir a la URL de pago (en tu caso simulado)
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
        <button 
          className="btn btn-primary mt-3"
          onClick={() => navigate('/catalogue')}
        >
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
                  <input 
                    className="form-check-input" 
                    type="radio" 
                    id="mock-payment" 
                    name="payment" 
                    defaultChecked 
                  />
                  <label className="form-check-label" htmlFor="mock-payment">
                    Pago Simulado (Demo)
                  </label>
                </div>
                <p className="text-muted mt-2">
                  Esta es una simulación de pago. No se realizará ningún cargo real.
                </p>
              </div>

              {error && (
                <div className="alert alert-danger mt-3">{error}</div>
              )}

              <button
                className="btn btn-success w-100 mt-3"
                onClick={handlePayment}
                disabled={loading}
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