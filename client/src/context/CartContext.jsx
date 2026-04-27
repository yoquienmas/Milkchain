import { createContext, useState, useContext, useEffect } from "react";

const CartContext = createContext();

// EXPORT 1: El Hook personalizado (Este es el que te está fallando)
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart debe usarse dentro de CartProvider");
  return context;
};

// EXPORT 2: El Provider
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
      // Si ya existe, actualizamos su cantidad con la nueva
      return prev.map(item => 
        item.id === product.id ? { ...item, cantidad: product.cantidad } : item
      );
    }
    // Si no existe, lo agregamos
    return [...prev, product];
  });
};

  const eliminar_producto_carrito = (id) => {
    setCart((prev) => prev.filter(item => item.id !== id));
  };

  const total = cart.reduce((acc, item) => acc + (item.precio * (item.cantidad || 1)), 0);
const actualizarCantidad = (id, nuevaCantidad) => {
  // 1. Evitamos cantidades menores a 1
  if (nuevaCantidad < 1) return;

  setCart((prev) =>
    prev.map((item) =>
      // 2. Buscamos el producto por ID y actualizamos solo su cantidad
      item.id === id ? { ...item, cantidad: nuevaCantidad } : item
    )
  );
};
  return (
    <CartContext.Provider value={{ cart, agregarProducto, eliminar_producto_carrito, actualizarCantidad, actualizarCantidad, total }}>
      {children}
    </CartContext.Provider>
  );
};
