// // components/Cart.jsx
// import React from 'react';
// import { usePayment } from '../contexts/PaymentContext';

// const Cart = () => {
//   const {
//     cart,
//     removeFromCart,
//     updateQuantity,
//     getCartTotal,
//     getCartItemsCount,
//     clearCart
//   } = usePayment();

//   if (cart.length === 0) {
//     return (
//       <div className="cart-empty">
//         <h2>Tu carrito está vacío</h2>
//         <p>Agrega algunos productos para continuar</p>
//       </div>
//     );
//   }

//   return (
//     <div className="cart">
//       <div className="cart-header">
//         <h2>Carrito de Compras</h2>
//         <span className="cart-count">{getCartItemsCount()} items</span>
//       </div>

//       <div className="cart-items">
//         {cart.map(item => (
//           <div key={item.id} className="cart-item">
//             <img src={item.image} alt={item.name} className="item-image" />
//             <div className="item-details">
//               <h3>{item.name}</h3>
//               <p className="item-price">${item.price}</p>
//             </div>
//             <div className="quantity-controls">
//               <button
//                 onClick={() => updateQuantity(item.id, item.quantity - 1)}
//                 disabled={item.quantity <= 1}
//               >
//                 -
//               </button>
//               <span>{item.quantity}</span>
//               <button
//                 onClick={() => updateQuantity(item.id, item.quantity + 1)}
//               >
//                 +
//               </button>
//             </div>
//             <button
//               className="remove-btn"
//               onClick={() => removeFromCart(item.id)}
//             >
//               Eliminar
//             </button>
//           </div>
//         ))}
//       </div>

//       <div className="cart-footer">
//         <div className="cart-total">
//           <strong>Total: ${getCartTotal().toFixed(2)}</strong>
//         </div>
//         <div className="cart-actions">
//           <button className="clear-btn" onClick={clearCart}>
//             Vaciar Carrito
//           </button>
//           <button className="checkout-btn">
//             Proceder al Pago
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Cart;