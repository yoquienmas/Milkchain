import { useCart } from "../context/CartContext";

function CartPage() {
  // Traemos los nuevos nombres de las funciones desde el contexto
  const { cart, eliminar_producto_carrito, total } = useCart();

  return (
    <div className="cart-container" style={{ padding: '20px', minHeight: '80vh' }}>
      <h1>Carrito de Compras - MilkChain</h1>
      
      {cart.length === 0 ? (
        <p>Tu carrito está vacío. ¡Ve al catálogo y elige tus productos!</p>
      ) : (
        <>
          <table className="cart-table" style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f4f4f4', borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '10px' }}>Producto</th>
                <th>Precio Unitario</th>
                <th>Cantidad</th>
                <th>Subtotal</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {cart.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #ddd', textAlign: 'center' }}>
                  <td style={{ padding: '15px' }}>{item.nombre}</td>
                  {/* Validamos que el precio exista para evitar el NaN */}
                  <td>${Number(item.precio || 0).toFixed(2)}</td>
                  <td>{item.cantidad}</td>
                  <td>${(Number(item.precio || 0) * (item.cantidad || 0)).toFixed(2)}</td>
                  <td>
                    <button 
                      // Usamos el nuevo nombre de la función
                      onClick={() => eliminar_producto_carrito(item.id)}
                      style={{ backgroundColor: '#e57373', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="cart-summary" style={{ marginTop: '30px', textAlign: 'right', padding: '20px', backgroundColor: '#f9f9f9' }}>
            {/* Validamos el total general */}
            <h2>Total: ${Number(total || 0).toFixed(2)}</h2>
            <button className="btn-green" style={{ fontSize: '1.2em', padding: '15px 30px', backgroundColor: '#81c784', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Finalizar Pedido
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default CartPage;