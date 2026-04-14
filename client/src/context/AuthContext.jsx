import { createContext, useState, useContext } from "react";
import axios from "axios";

const AuthContext = createContext();

// Esta línea de abajo es la que elimina el error de ESLint:
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const signup = async (values) => {
    try {
      const res = await axios.post("http://localhost:3000/api/register", values);
      setUser(res.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.log(error);
    }
  };

  const signin = async (user) => {
    try {
      const res = await axios.post("http://localhost:3000/api/login", user);
      setUser(res.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.log(error);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, signup, signin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};