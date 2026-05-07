import { createContext, useState, useContext, useEffect } from "react";

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart debe usarse dentro de CartProvider");
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("milkchain_cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem("milkchain_cart", JSON.stringify(cart));
  }, [cart]);

  const agregarProducto = (product) => {
    setCart((prev) => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.map(item => 
          item.id === product.id ? { ...item, cantidad: product.cantidad } : item
        );
      }
      return [...prev, product];
    });
  };

 
  const eliminar_producto_carrito = (id) => {
    setCart((prev) => prev.filter(item => item.id !== id));
  };

  const total = cart.reduce((acc, item) => acc + (item.precio * (item.cantidad || 1)), 0);

  return (
    <CartContext.Provider value={{ 
      cart, 
      agregarProducto, 
      eliminar_producto_carrito, 
      total 
    }}>
      {children}
    </CartContext.Provider>
  );
};