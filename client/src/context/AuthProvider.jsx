// import React, { useState, useEffect, useCallback } from 'react';
// import axios from 'axios';
// import { AuthContext } from './AuthContext.jsx';

// const API_URL = 'http://localhost:3000/api';

// // Configuración global de axios para cookies
// axios.defaults.withCredentials = true;

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [loading, setLoading] = useState(true);

//   // Verificar autenticación llamando al endpoint real
//   const checkAuth = useCallback(async () => {
//     try {
//       console.log('🔍 Verificando autenticación...');
      
//       const response = await axios.get(`${API_URL}/auth/verify`);
      
//       if (response.data.authenticated) {
//         setIsAuthenticated(true);
//         setUser(response.data.user);
//         console.log('✅ Usuario autenticado:', response.data.user);
//       } else {
//         setIsAuthenticated(false);
//         setUser(null);
//         console.log('❌ Usuario no autenticado');
//       }
//     } catch (error) {
//       console.log('❌ Error verificando autenticación:', error.response?.status, error.response?.data);
//       setIsAuthenticated(false);
//       setUser(null);
      
//       // Si es error 404, el endpoint no existe todavía
//       if (error.response?.status === 404) {
//         console.log('⚠️ Endpoint /auth/verify no existe aún en el backend');
//       }
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     checkAuth();
//   }, [checkAuth]);

//   const login = async (credentials) => {
//     try {
//       console.log('🔐 Intentando login...', credentials);
      
//       // El backend debería establecer la cookie automáticamente
//       // Verificamos la autenticación nuevamente para obtener los datos del usuario
//       await checkAuth();
//       console.log('✅ Login exitoso');
//       return { success: true, user: user };
//     } catch (error) {
//       console.error('❌ Error en login:', error.response?.data);
//       return { 
//         success: false, 
//         error: error.response?.data?.message || 'Error en login' 
//       };
//     }
//   };

//   const register = async (userData) => {
//     try {
//       console.log('📝 Intentando registro...', userData);
      
//       // Verificamos la autenticación nuevamente para obtener los datos del usuario
//       await checkAuth();
//       console.log('✅ Registro exitoso');
//       return { success: true, user: user };
//     } catch (error) {
//       console.error('❌ Error en registro:', error.response?.data);
//       return { 
//         success: false, 
//         error: error.response?.data?.message || 'Error en registro' 
//       };
//     }
//   };

//   const logout = async () => {
//     try {
//       await axios.post(`${API_URL}/auth/logout`);
//     } catch (error) {
//       console.error('Error en logout:', error);
//     } finally {
//       setUser(null);
//       setIsAuthenticated(false);
//       console.log('🚪 Usuario cerró sesión');
//     }
//   };

//   const value = {
//     user,
//     isAuthenticated,
//     loading,
//     login,
//     register,
//     logout,
//     checkAuth
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// };