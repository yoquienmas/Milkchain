import { useForm } from "react-hook-form";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();

  const onSubmit = handleSubmit(async (values) => {
    try {
      // Enviamos los datos al servidor de Node
      const res = await axios.post("http://localhost:3000/api/register", values);
      console.log("Usuario registrado:", res.data);
      
      // Si todo sale bien, lo mandamos al login
      navigate("/login");
   } catch (error) {
  // Cambiá el console.log para ver el mensaje real que viene del servidor
  console.error("Error detallado:", error.response?.data);
  alert("Error: " + (error.response?.data?.message || "Error interno del servidor"));
    }
  });

  return (
    <div className="register-container">
      <form onSubmit={onSubmit} className="register-form">
        <h1>Crear Cuenta</h1>
        <input type="text" {...register("nombre")} placeholder="Nombre" required />
        <input type="text" {...register("apellido")} placeholder="Apellido" required />
        <input type="number" {...register("dni")} placeholder="DNI" required />
        <input type="number" {...register("telefono")} placeholder="Teléfono" required />
        <input type="email" {...register("email")} placeholder="Correo Electrónico" required />
        <input type="password" {...register("password")} placeholder="Contraseña" required />
        <button type="submit" className="btn-green">Registrarse</button>
      </form>
    </div>
  );
}