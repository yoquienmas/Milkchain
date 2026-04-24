import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

function CartPage() {
  const navigate = useNavigate();
  const { cart, eliminar_producto_carrito, actualizarCantidad, total } = useCart();
  const [paso, setPaso] = useState(1);

  const siguientePaso = () => setPaso(paso + 1);
  const volverPaso = () => setPaso(paso - 1);

  const btnStyle = {
    width: '35px',
    height: '35px',
    borderRadius: '50%',
    border: '1px solid #ddd',
    cursor: 'pointer',
    backgroundColor: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem'
  };

  return (
    <div className="cart-container" style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', minHeight: '80vh' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.8rem', margin: 0 }}>Mi Carrito</h1>
      </div>

      {/* Indicador de Pasos */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px', borderBottom: '2px solid #eee', paddingBottom: '20px' }}>
        <span style={{ fontWeight: paso === 1 ? 'bold' : 'normal', color: paso === 1 ? '#4CAF50' : '#999' }}>1. Revisar Carrito</span>
        <span style={{ fontWeight: paso === 2 ? 'bold' : 'normal', color: paso === 2 ? '#4CAF50' : '#999' }}>2. Envío</span>
        <span style={{ fontWeight: paso === 3 ? 'bold' : 'normal', color: paso === 3 ? '#4CAF50' : '#999' }}>3. Pago y Finalizar</span>
      </div>

      {cart.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <p style={{ fontSize: '1.2rem', color: '#666' }}>Tu carrito está vacío.</p>
          <button onClick={() => navigate("/catalogue")} className="btn-green-main" style={{ marginTop: '20px' }}>
            Ir al catálogo
          </button>
        </div>
      ) : (
        <>
          {/* PASO 1: REVISAR CARRITO */}
          {paso === 1 && (
            <div className="step-animation">
              <h2 style={{ color: '#444' }}>Tu Pedido</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #eee' }}>
                    <th style={{ padding: '15px', textAlign: 'left' }}>Producto</th>
                    <th>Precio</th>
                    <th>Cantidad</th>
                    <th>Subtotal</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #eee', textAlign: 'center' }}>
                      <td style={{ padding: '15px', textAlign: 'left' }}>{item.nombre}</td>
                      <td>${Number(item.precio).toFixed(2)}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                          <button onClick={() => actualizarCantidad(item.id, Number(item.cantidad) - 1)} style={btnStyle}>-</button>
                          <span style={{ fontWeight: 'bold', minWidth: '20px' }}>{item.cantidad}</span>
                          <button onClick={() => actualizarCantidad(item.id, Number(item.cantidad) + 1)} style={btnStyle}>+</button>
                        </div>
                      </td>
                      <td>${(item.precio * item.cantidad).toFixed(2)}</td>
                      <td>
                        <button onClick={() => eliminar_producto_carrito(item.id)} style={{ color: '#ff5252', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '30px' }}>
                <button onClick={() => navigate("/catalogue")} className="btn-outline" style={{ padding: '12px 20px' }}>
                  ← Volver al catálogo
                </button>

                <div style={{ textAlign: 'right' }}>
                  <h3 style={{ fontSize: '1.4rem', margin: '0 0 15px 0' }}>Total: ${total.toFixed(2)}</h3>
                  <button onClick={siguientePaso} className="btn-green-main">
                    Continuar al Envío →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PASO 2: ENVÍO */}
          {paso === 2 && (
            <div className="step-animation">
              <h2>¿Dónde enviamos tu pedido?</h2>
              <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px', marginBottom: '20px', backgroundColor: '#fdfdfd' }}>
                <p><strong>Dirección:</strong> Calle Falsa 123, Corrientes</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={volverPaso} className="btn-outline">Atrás</button>
                <button onClick={siguientePaso} className="btn-green-main">Ir a Pagar</button>
              </div>
            </div>
          )}

          {/* PASO 3: PAGO */}
          {paso === 3 && (
            <div className="step-animation" style={{ textAlign: 'center' }}>
              <h2>Resumen Final</h2>
              <div style={{ padding: '30px', border: '2px dashed #eee', borderRadius: '15px', marginBottom: '20px' }}>
                <p style={{ fontSize: '1.2rem' }}>Estás por pagar: <strong>${total.toFixed(2)}</strong></p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                <button onClick={volverPaso} className="btn-outline">Atrás</button>
                <button className="btn-green-confirm" onClick={() => alert("¡Compra realizada con éxito!")}>Finalizar Compra</button>
              </div>
            </div>
          )}
        </>
      )}

      <style>{`
        .btn-green-main { background-color: #4CAF50; color: white; padding: 12px 25px; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; transition: 0.3s; }
        .btn-green-main:hover { background-color: #45a049; transform: scale(1.02); }
        .btn-green-confirm { background-color: #2e7d32; color: white; padding: 15px 40px; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 1.1rem; }
        .btn-outline { background: white; border: 1px solid #ccc; color: #666; border-radius: 5px; cursor: pointer; font-weight: 500; transition: 0.3s; }
        .btn-outline:hover { background-color: #f5f5f5; border-color: #999; }
        .step-animation { animation: fadeIn 0.3s ease-in; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

export default CartPage;