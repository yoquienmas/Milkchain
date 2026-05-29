import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/ContextoAutenticacion.jsx";
import { useToast } from "../context/ContextoToast.jsx";
import { FiMail, FiLock, FiArrowRight } from "react-icons/fi";
import "../App.css";

export default function InicioSesionPagina() {
  const [email, setEmail] = useState("");
  const [password, setPass] = useState(""); 
  const navigate = useNavigate();
  
  const { signin } = useAuth();
  const { mostrarToast } = useToast();

  const manejarSubmit = async (e) => {
    e.preventDefault();
    
    try {
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
            margin: "0 auto 15px auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <img 
              src="/images/logo_MILKCHAIN.png" 
              alt="MilkChain Logo" 
              className="logo-themed"
              style={{ 
                height: "100%", 
                objectFit: "contain",
                display: "block"
              }} 
            />
          </div>
          <h1 style={{ fontFamily: "var(--font-serif)", color: "var(--text-dark)", fontSize: "1.9rem", marginBottom: "5px" }}>
            Iniciar sesión
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

          <button type="submit" style={{ width: "100%", marginTop: "20px", padding: "14px" }}>
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
    </div>
  );
}