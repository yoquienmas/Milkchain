// import React, { useState } from 'react';
// import { PaymentContext } from './PaymentContext.jsx';

// // Provider component - SOLO exportamos esto
// export const PaymentProvider = ({ children }) => {
//   const [loading, setLoading] = useState(false);
//   const [paymentStatus, setPaymentStatus] = useState(null);

//   // Función para crear orden de pago
//   const createOrder = async (cartData) => {
//     setLoading(true);
//     try {
//       console.log('💳 Creando orden de pago...', cartData);
      
//       const response = await fetch('http://localhost:3000/api/payment/create-order', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         credentials: 'include',
//         body: JSON.stringify({ 
//           items: cartData.items, 
//           total: cartData.total 
//         })
//       });

//       console.log('📊 Respuesta del servidor:', response.status, response.statusText);

//       if (!response.ok) {
//         const errorData = await response.json();
//         console.error('❌ Error del servidor:', errorData);
//         throw new Error(errorData.message || 'Error al crear la orden');
//       }

//       const data = await response.json();
//       console.log('✅ Orden creada exitosamente:', data);
//       return data;
//     } catch (error) {
//       console.error('❌ Error en createOrder:', error);
//       throw error;
//     } finally {
//       setLoading(false);
//     }
//   };

//   const value = {
//     createOrder,
//     loading,
//     paymentStatus,
//     setPaymentStatus
//   };

//   return (
//     <PaymentContext.Provider value={value}>
//       {children}
//     </PaymentContext.Provider>
//   );
// };

// // NO exportes usePayment desde aquí