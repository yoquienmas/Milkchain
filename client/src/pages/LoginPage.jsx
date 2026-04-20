import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext"; // Usamos el hook para acceder al contexto global
import "../App.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState(""); 
  const navigate = useNavigate();
  
  // Traemos la función signin del contexto global
  const { signin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // 1. Llamada al backend para validar credenciales
      const res = await axios.post("http://localhost:3000/api/login", {
        email,
        pass
      }, {
        withCredentials: true // Permite el manejo de cookies si tu backend las usa
      });

      console.log("Respuesta del servidor:", res.data);

      // 2. Verificamos si el login fue exitoso
      if (res.status === 200) {
        console.log("Login exitoso, llamando a signin del contexto");
        
        // !!! PARTE CRÍTICA !!!
        // Enviamos los datos del usuario al contexto global.
        // Esto cambia isAuthenticated a true y hace que el Navbar se actualice.
        signin(res.data); 
        
        alert("¡Bienvenido a MilkChain!");
        
        // 3. Redirigimos al usuario al Home una vez autenticado
        navigate("/home");
      }

    } catch (error) {
      console.error("Error al loguear:", error.response?.data);
      // Muestra el mensaje de error específico del servidor o uno genérico
      alert(error.response?.data?.message || "Credenciales incorrectas");
    }
  };

  return (
    <div className="container">
      <h1 className="title">Inicio de Sesión</h1>

      <form className="form" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Correo"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={pass}
          required
          onChange={(e) => setPass(e.target.value)}
        />

        <button type="submit">Ingresar</button>
      </form>
    </div>
  );
}