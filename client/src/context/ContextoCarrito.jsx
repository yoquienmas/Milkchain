import React, { createContext, useContext, useState, useEffect } from 'react';

// 1. Creamos el contexto
const ContextoCarrito = createContext();

// 2. Hook personalizado para usar el carrito fácilmente
export const useCart = () => {
  const context = useContext(ContextoCarrito);
  if (!context) {
    throw new Error("useCart debe usarse dentro de CartProvider");
  }
  return context;
};

// 3. Definimos el Provider
export const CartProvider = ({ children }) => {
  // Inicializamos el carrito desde localStorage
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("milkchain_cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const vaciarCarrito = () => {
    setCart([]); 
    localStorage.removeItem("milkchain_cart"); 
  };

  // Persistencia: Guardar en localStorage cada vez que el carrito cambie
  useEffect(() => {
    localStorage.setItem("milkchain_cart", JSON.stringify(cart));
  }, [cart]);

  // Función para agregar productos (Maneja incremento si ya existe)
  const agregarProducto = (product) => {
    const idABuscar = product.id_producto || product.id; 

    const precioNumerico = parseFloat(product.precio) || 0;
    const cantidadNumerica = parseInt(product.cantidad) || 1;
    setCart((prev) => {
      const exists = prev.find(item => (item.id_producto || item.id) === idABuscar);
      if (exists) {
        return prev.map(item =>
          (item.id_producto || item.id) === idABuscar 
            ? { ...item, cantidad: item.cantidad + (product.cantidad || 1) } 
            : item
        );
      }
      return [...prev, { ...product, precio: precioNumerico, cantidad: cantidadNumerica }];
    });
  };

  const actualizarCantidad = (id, nuevaCantidad) => {
    if (nuevaCantidad < 1) return; 
    setCart((prev) =>
      prev.map((item) =>
        (item.id_producto || item.id) === id ? { ...item, cantidad: nuevaCantidad } : item
      )
    );
  };

  const eliminar_producto_carrito = (id) => {
    setCart((prev) => prev.filter(item => (item.id_producto || item.id) !== id));
  };

  // Cálculo del total antiguo (mantenido por compatibilidad)
  const total = cart.reduce((acc, item) => {
    const precio = parseFloat(item.precio) || 0;
    const cantidad = parseInt(item.cantidad) || 0;
    return acc + (precio * cantidad);
  }, 0);

  // NUEVO: Función para calcular el monto total dinámicamente
  const calcularMontoTotal = () => {
    return cart.reduce((acc, item) => {
      const precio = parseFloat(item.precio) || 0;
      const cantidad = parseInt(item.cantidad) || 1;
      return acc + (precio * cantidad);
    }, 0);
  };

  return (
    <ContextoCarrito.Provider value={{ 
      cart, 
      agregarProducto, 
      actualizarCantidad, 
      eliminar_producto_carrito, 
      total,
      vaciarCarrito,
      calcularMontoTotal // MODIFICADO: Agregado al value del Provider
    }}>
      {children}
    </ContextoCarrito.Provider>
  );
};