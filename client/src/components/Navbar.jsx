import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <Link to="/">MilkChain</Link>
      </div>
      <ul className="navbar-links">
        {isAuthenticated ? (
          <>
            <li><span>Hola, {user?.nombre}</span></li>
            <li><button onClick={logout} className="btn-logout">Salir</button></li>
          </>
        ) : (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Registro</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
}