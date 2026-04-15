import { useCart } from "../context/CartContext";

function CartPage() {
  const { cart, removeFromCart, total } = useCart();

  return (
    <div className="cart-container" style={{ padding: '20px' }}>
      <h1>Carrito de Compras - MilkChain</h1>
      
      {cart.length === 0 ? (
        <p>Tu carrito está vacío. ¡Ve al catálogo y elige tus productos!</p>
      ) : (
        <>
          <table className="cart-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f4f4f4' }}>
                <th>Producto</th>
                <th>Precio Unitario</th>
                <th>Cantidad</th>
                <th>Subtotal</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #ddd', textAlign: 'center' }}>
                  <td>{item.nombre}</td>
                  <td>${item.precio}</td>
                  <td>{item.cantidad}</td>
                  <td>${(item.precio * item.cantidad).toFixed(2)}</td>
                  <td>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      style={{ backgroundColor: '#e57373', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="cart-summary" style={{ marginTop: '20px', textAlign: 'right' }}>
            <h2>Total: ${total.toFixed(2)}</h2>
            <button className="btn-green" style={{ fontSize: '1.2em', padding: '15px 30px' }}>
              Finalizar Pedido
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default CartPage; 