import { useContext } from 'react';
import { CartContext } from './CarritoAutenticacion.jsx';

export const useCart = () => {
  const context = useContext(CartContext);
  
  if (context === undefined) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  
  return context;
};