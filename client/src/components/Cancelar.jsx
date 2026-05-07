// import React from 'react';
// import { useNavigate } from 'react-router-dom';

// const Cancel = () => {
//   const navigate = useNavigate();

//   return (
//     <div className="cancel-page text-center">
//       <div className="card border-danger">
//         <div className="card-body py-5">
//           <div className="text-danger mb-4" style={{ fontSize: '4rem' }}>✕</div>
//           <h1 className="card-title text-danger mb-3">Pago Cancelado</h1>
//           <p className="card-text text-muted mb-3">El proceso de pago ha sido cancelado.</p>
//           <p className="card-text text-muted mb-4">Puedes intentarlo nuevamente cuando lo desees.</p>
          
//           <div className="mt-4">
//             <button 
//               className="btn btn-primary me-3"
//               onClick={() => navigate('/cart')}
//             >
//               Volver al Carrito
//             </button>
//             <button 
//               className="btn btn-outline-secondary"
//               onClick={() => navigate('/catalogue')}
//             >
//               Seguir Comprando
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Cancel;