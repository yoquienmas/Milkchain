import React, {useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './useAuth.jsx';
import { CartContext } from './CartContext.jsx';

const API_URL = 'http://localhost:3000/api';

// Configuración de axios para trabajar con cookies
axios.defaults.withCredentials = true; // Esto es importante para enviar cookies

// ELIMINA el interceptor de headers ya que el backend espera el token en cookies
// axios.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// Interceptor para debugging mejorado
axios.interceptors.request.use((config) => {
  console.log('📤 Enviando petición a:', config.url);
  console.log('🍪 Credenciales incluidas:', config.withCredentials);
  return config;
});

axios.interceptors.response.use(
  (response) => {
    console.log('✅ Respuesta exitosa:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.log('❌ Error en respuesta:', error.response?.status, error.config?.url);
    console.log('📄 Mensaje de error:', error.response?.data);
    return Promise.reject(error);
  }
);

export const CartProvider = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // 1. Cargar el carrito cuando el usuario se autentica
  useEffect(() => {
    async function loadCart() {
      if (authLoading) {
        console.log('⏳ Auth still loading...');
        return;
      }

      console.log('🔍 Estado de autenticación:', isAuthenticated);
      
      if (isAuthenticated) {
        try {
          console.log('🔄 Cargando carrito...');
          const res = await axios.get(`${API_URL}/cart`);
          console.log('✅ Carrito cargado:', res.data);
          setCart(res.data);
        } catch (error) {
          console.error('❌ Error al cargar el carrito:', error);
          console.error('📄 Detalles del error:', error.response?.data);
          setCart({ items: [], total: 0 });
        }
      } else {
        console.log('👤 Usuario no autenticado, carrito vacío');
        setCart({ items: [], total: 0 });
      }
      setIsLoading(false);
    }
    loadCart();
  }, [isAuthenticated, authLoading]);

  // 2. Agregar al carrito
  const handleIncreaseQuantity = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para añadir productos.');
      return;
    }
    
    try {
      console.log('🛒 Añadiendo producto:', productId, 'cantidad:', quantity);
      const res = await axios.post(`${API_URL}/cart/add`, { productId, quantity });
      console.log('✅ Producto añadido:', res.data);
      setCart(res.data); 
    } catch (error) {
      console.error('❌ Error al añadir producto:', error);
      console.error('📄 Detalles del error:', error.response?.data);
      alert('Error al añadir producto. Verifica la consola para más detalles.');
    }
  };
  
  // 3. Eliminar ítem completo
  const handleRemoveItem = async (productId) => {
    if (!isAuthenticated) return;
    
    try {
      const res = await axios.delete(`${API_URL}/cart/remove/${productId}`);
      setCart(res.data); 
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      alert(`Error: ${error.response?.data?.message || 'No se pudo eliminar el producto'}`);
    }
  };
  
  // 4. Vaciar carrito
  const handleClearCart = async () => {
    if (!isAuthenticated) return;
    
    try {
      await axios.delete(`${API_URL}/cart/clear`); 
      setCart({ items: [], total: 0 });
    } catch (error) {
      console.error('Error al vaciar carrito:', error);
    }
  };

  // Función para contar items
  const getCartItemsCount = () => {
    return cart.items?.reduce((total, item) => total + item.quantity, 0) || 0;
  };

  const contextValue = {
    cart,
    isLoading,
    isAuthenticated,
    handleIncreaseQuantity,
    handleRemoveItem,
    handleClearCart,
    getCartItemsCount,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
};