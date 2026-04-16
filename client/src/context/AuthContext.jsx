import { createContext, useState, useContext } from "react";

// 1. Creamos el contexto
export const AuthContext = createContext();

// 2. Hook personalizado
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};

// 3. Componente Provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Función para actualizar el estado global
  const signin = (userData) => {
    console.log("AuthProvider: Actualizando usuario y estado...");
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
  setUser(null);
  setIsAuthenticated(false);
  // Si querés usar la redirección nativa del navegador:
  window.location.href = "/login"; // O "/" para la página principal
};

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, signin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};