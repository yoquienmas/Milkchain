// import React, { useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useCart } from '../context/useCart.jsx';

// const Success = () => {
//   const navigate = useNavigate();
//   const { handleClearCart } = useCart();

//   useEffect(() => {
//     // Limpiar carrito cuando se muestra la página de éxito
//     handleClearCart();
//   }, [handleClearCart]);

//   return (
//     <div className="success-page text-center">
//       <div className="card border-success">
//         <div className="card-body py-5">
//           <div className="text-success mb-4" style={{ fontSize: '4rem' }}>✓</div>
//           <h1 className="card-title text-success mb-3">¡Pago Exitoso!</h1>
//           <p className="card-text text-muted mb-3">Tu pedido ha sido procesado correctamente.</p>
//           <p className="card-text text-muted mb-4">Recibirás un correo de confirmación shortly.</p>
          
//           <div className="mt-4">
//             <button 
//               className="btn btn-primary me-3"
//               onClick={() => navigate('/catalogue')}
//             >
//               Continuar Comprando
//             </button>
//             <button 
//               className="btn btn-outline-secondary"
//               onClick={() => navigate('/')}
//             >
//               Volver al Inicio
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Success;