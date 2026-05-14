import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function RegistroPagina() {
  const { register, handleSubmit } = useForm(); 
  const navigate = useNavigate();

  const onSubmit = handleSubmit(async (values) => {
    try {
      const res = await axios.post("http://localhost:3000/api/register", values);
      console.log("Usuario registrado:", res.data);
      
      // --- MENSAJE DE CONFIRMACIÓN ---
      alert("¡Registro exitoso! Ya puedes iniciar sesión con tu cuenta.");
      
      // Redirigimos después de que el usuario cierre el alert
      navigate("/login");
    } catch (error) {
      console.error("Error detallado:", error.response?.data);
      alert("Error: " + (error.response?.data?.message || "Error interno del servidor"));
    }
  });

  return (
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
    </div>
  );
}