import { createContext, useState, useContext, useEffect } from "react";

export const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // 1. Al iniciar, intentamos recuperar el usuario del localStorage
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("milkchain_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // 2. Definimos isAuthenticated basado en si existe el objeto user
  const [isAuthenticated, setIsAuthenticated] = useState(!!user);

  // 3. Efecto para mantener sincronizado isAuthenticated si el user cambia
  useEffect(() => {
    if (user) {
      localStorage.setItem("milkchain_user", JSON.stringify(user));
      setIsAuthenticated(true);
    } else {
      localStorage.removeItem("milkchain_user");
      setIsAuthenticated(false);
    }
  }, [user]);

  const signin = (userData) => {
    console.log("AuthProvider: Iniciando sesión...");
    setUser(userData); // El useEffect se encarga de guardar en localStorage
  };

  const logout = () => {
    console.log("AuthProvider: Cerrando sesión...");
    setUser(null);
    // Limpiamos también el carrito al cerrar sesión para seguridad
    localStorage.removeItem("milkchain_cart");
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, signin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};