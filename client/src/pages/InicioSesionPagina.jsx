import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/ContextoAutenticacion.jsx"; // Usamos el hook para acceder al contexto global
import "../App.css";

export default function InicioSesionPagina() {
  const [email, setEmail] = useState("");
  const [password, setPass] = useState(""); 
  const navigate = useNavigate();
  
  // Traemos la función signin del contexto global
  const { signin } = useAuth();

  const manejarSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // 1. Llamada al backend para validar credenciales
     const res = await axios.post("http://localhost:3000/api/login", {
        email,
        password
       }, {
         withCredentials: true 
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
    // Si el backend envía { message: "..." }, accedemos así:
    const msg = error.response?.data?.message || "Error al iniciar sesión";
    alert(msg);
}
  };

  return (
    <div className="container">
      <h1 className="title">Inicio de Sesión</h1>

      <form className="form" onSubmit={manejarSubmit}>
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
          value={password}
          required
          onChange={(e) => setPass(e.target.value)}
        />

        <button type="submit">Ingresar</button>
      </form>
    </div>
  );
}