import { createContext, useState, useContext, useEffect } from "react";

const CartContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart debe usarse dentro de CartProvider");
  return context;
};

export const CartProvider = ({ children }) => {
  // 1. Al iniciar, intentamos cargar lo que haya en el almacenamiento local
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("milkchain_cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // 2. Cada vez que el carrito cambie, lo guardamos automáticamente
  useEffect(() => {
    localStorage.setItem("milkchain_cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart((prev) => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        // Actualiza la cantidad si ya existe
        return prev.map(item => 
          item.id === product.id ? { ...item, cantidad: product.cantidad } : item
        );
      }
      return [...prev, product];
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter(item => item.id !== id));
  };

  const total = cart.reduce((acc, item) => acc + (item.precio * (item.cantidad || 1)), 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, total }}>
      {children}
    </CartContext.Provider>
  );
};