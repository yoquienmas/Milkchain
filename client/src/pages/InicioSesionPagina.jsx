import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
<<<<<<< HEAD
import { useAuth } from "../context/ContextoAutenticacion.jsx"; // Usamos el hook para acceder al contexto global
=======
import { useAuth } from "../context/ContextoAutenticacion.jsx";
import { useToast } from "../context/ContextoToast.jsx";
import { FiMail, FiLock, FiArrowRight } from "react-icons/fi";
>>>>>>> Rama_Front
import "../App.css";

export default function InicioSesionPagina() {
  const [email, setEmail] = useState("");
  const [password, setPass] = useState(""); 
  const navigate = useNavigate();
  
<<<<<<< HEAD
  // Traemos la función signin del contexto global
  const { signin } = useAuth();
=======
  const { signin } = useAuth();
  const { mostrarToast } = useToast();
>>>>>>> Rama_Front

  const manejarSubmit = async (e) => {
    e.preventDefault();
    
    try {
<<<<<<< HEAD
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
=======
      const res = await axios.post("http://localhost:3000/api/login", {
        email,
        password
      }, {
        withCredentials: true 
      });

      console.log("Respuesta del servidor:", res.data);

      if (res.status === 200) {
        signin(res.data); 
        mostrarToast("¡Bienvenido a MilkChain!", "success");
        navigate("/home");
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Error al iniciar sesión";
      mostrarToast(msg, "error");
    }
  };

  return (
    <div className="login-page-container cow-pattern-dark">
      <div className="split-form-card" style={{ boxShadow: "var(--shadow-lg)" }}>
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div style={{
            height: "90px", 
            width: "90px", 
            borderRadius: "50%",
            border: "2.5px solid var(--border-color)",
            backgroundColor: "var(--bg-white)",
            padding: "6px",
            margin: "0 auto 15px auto",
            boxShadow: "var(--shadow-sm)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden"
          }}>
            <img 
              src="/images/logo_MILKCHAIN.png" 
              alt="MilkChain Logo" 
              className="logo-themed"
              style={{ 
                height: "100%", 
                width: "100%", 
                objectFit: "contain",
                display: "block"
              }} 
            />
          </div>
          <h1 style={{ fontFamily: "var(--font-serif)", color: "var(--text-dark)", fontSize: "1.9rem", marginBottom: "5px" }}>
            MilkChain
          </h1>
        </div>

        <form onSubmit={manejarSubmit}>
          <div className="input-group">
            <FiMail />
            <input
              type="email"
              placeholder="Correo Electrónico"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <FiLock />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              required
              onChange={(e) => setPass(e.target.value)}
            />
          </div>

          <button type="submit" style={{ width: "100%", marginTop: "10px", padding: "14px" }}>
            Ingresar <FiArrowRight />
          </button>
        </form>

        <p className="form-link-text">
          ¿No tienes cuenta aún?{" "}
          <span onClick={() => navigate("/register")}>
            Regístrate aquí
          </span>
        </p>
      </div>
>>>>>>> Rama_Front
    </div>
  );
}