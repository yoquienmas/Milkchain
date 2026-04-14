import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function RegisterPage() {
 const { register, handleSubmit } = useForm();  
  const { signup } = useAuth();
  const navigate = useNavigate();

  const onSubmit = handleSubmit(async (values) => {
    await signup(values);
    navigate("/login"); // Una vez registrado, al login
  });

  return (
    <div className="register-container">
      <form onSubmit={onSubmit} className="register-form">
        <h1>Crear Cuenta en MilkChain</h1>
        
        <input type="text" {...register("nombre", { required: true })} placeholder="Nombre" />
        <input type="text" {...register("apellido", { required: true })} placeholder="Apellido" />
        <input type="number" {...register("dni", { required: true })} placeholder="DNI" />
        <input type="number" {...register("telefono", { required: true })} placeholder="Teléfono" />
        <input type="email" {...register("email", { required: true })} placeholder="Correo Electrónico" />
        <input type="password" {...register("pass", { required: true })} placeholder="Contraseña" />

        <button type="submit" className="btn-green">Registrarse</button>
      </form>
    </div>
  );
}

export default RegisterPage;