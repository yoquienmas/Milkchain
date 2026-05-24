import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";
<<<<<<< HEAD

export default function RegistroPagina() {
  const { register, manejarSubmit } = useForm(); 
  const navigate = useNavigate();

  const onSubmit = manejarSubmit(async (values) => {
=======
import { useToast } from "../context/ContextoToast.jsx";
import { FiUser, FiCreditCard, FiPhone, FiMail, FiLock, FiUserPlus } from "react-icons/fi";
import "../App.css";

export default function RegistroPagina() {
  const { register, handleSubmit } = useForm(); 
  const navigate = useNavigate();
  const { mostrarToast } = useToast();

  const onSubmit = handleSubmit(async (values) => {
>>>>>>> Rama_Front
    try {
      const res = await axios.post("http://localhost:3000/api/register", values);
      console.log("Usuario registrado:", res.data);
      
<<<<<<< HEAD
      // --- MENSAJE DE CONFIRMACIÓN ---
      alert("¡Registro exitoso! Ya puedes iniciar sesión con tu cuenta.");
      
      // Redirigimos después de que el usuario cierre el alert
      navigate("/login");
    } catch (error) {
      console.error("Error detallado:", error.response?.data);
      alert("Error: " + (error.response?.data?.message || "Error interno del servidor"));
=======
      mostrarToast("¡Registro exitoso! Ya puedes iniciar sesión con tu cuenta.", "success");
      navigate("/login");
    } catch (error) {
      console.error("Error detallado:", error.response?.data);
      mostrarToast("Error: " + (error.response?.data?.message || "Error interno del servidor"), "error");
>>>>>>> Rama_Front
    }
  });

  return (
<<<<<<< HEAD
    <div className="register-container">
      <form onSubmit={onSubmit} className="register-form">
        <h1 style={{ color: "#248a4d" }}>Crear Cuenta en MilkChain</h1>
        
        <input type="text" {...register("nombre")} placeholder="Nombre" required />
        <input type="text" {...register("apellido")} placeholder="Apellido" required />
        <input type="text" {...register("dni")} placeholder="DNI" required />        
        <input type="text" {...register("id_telefono")} placeholder="Teléfono" required />
        <input type="email" {...register("email")} placeholder="Correo Electrónico" required />
        <input type="password" {...register("password")} placeholder="Contraseña" required />
        
        <button type="submit" className="btn-green">Registrarse</button>
        
        <p style={{ marginTop: "15px", fontSize: "0.9rem" }}>
          ¿Ya tienes cuenta? <span 
            onClick={() => navigate("/login")} 
            style={{ color: "#248a4d", cursor: "pointer", fontWeight: "bold" }}
          >
            Inicia sesión aquí
          </span>
        </p>
      </form>
=======
    <div className="login-page-container cow-pattern-dark">
      <div className="split-form-card" style={{ maxWidth: "480px", padding: "35px", boxShadow: "var(--shadow-lg)" }}>
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
          <h1 style={{ fontFamily: "var(--font-serif)", color: "var(--text-dark)", fontSize: "1.7rem" }}>
            Crear Cuenta
          </h1>
          <p className="subtitle" style={{ margin: "4px 0 0 0" }}>
            Únete a la familia láctea MilkChain
          </p>
        </div>
        
        <form onSubmit={onSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="input-group">
              <FiUser />
              <input type="text" {...register("nombre")} placeholder="Nombre" required />
            </div>
            
            <div className="input-group">
              <FiUser />
              <input type="text" {...register("apellido")} placeholder="Apellido" required />
            </div>
          </div>

          <div className="input-group">
            <FiCreditCard />
            <input type="text" {...register("dni")} placeholder="DNI" required />
          </div>        

          <div className="input-group">
            <FiPhone />
            <input type="text" {...register("id_telefono")} placeholder="Teléfono" required />
          </div>

          <div className="input-group">
            <FiMail />
            <input type="email" {...register("email")} placeholder="Correo Electrónico" required />
          </div>

          <div className="input-group">
            <FiLock />
            <input type="password" {...register("password")} placeholder="Contraseña" required />
          </div>
          
          <button type="submit" style={{ width: "100%", marginTop: "10px", padding: "14px" }}>
            <FiUserPlus /> Registrarse
          </button>
        </form>
        
        <p className="form-link-text">
          ¿Ya tienes cuenta?{" "}
          <span onClick={() => navigate("/login")}>
            Inicia sesión aquí
          </span>
        </p>
      </div>
>>>>>>> Rama_Front
    </div>
  );
}