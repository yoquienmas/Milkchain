import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

function HomePage() {
  const { user, logout } = useAuth();

  return (
    <div className="home-container">
      <header className="home-header">
        <h2>MilkChain</h2>
        <div className="user-info">
          <span>Hola, {user?.nombre || 'Usuario'}</span>
          <button onClick={logout} className="btn-logout" style={{marginLeft: '15px', background: 'none', border: 'none', color: 'blue', cursor: 'pointer'}}>
            Cerrar sesión
          </button>
        </div>
      </header>

      <div className="title-banner" style={{background: '#ddd', padding: '20px', textAlign: 'center', margin: '20px 0'}}>
        <h1>Inicio Cliente</h1>
      </div>

      <div className="home-menu-grid">
        <button className="btn-green">Ver pedidos</button>
        <button className="btn-green">Ver envíos</button>
        <button className="btn-green">Devolver pedido</button>
        <button className="btn-green">Contactarse con vendedor</button>
        <Link to="/catalogue" className="btn-green" style={{textDecoration: 'none'}}>
            Catálogo
        </Link>
      </div>
    </div>
  );
}

export default HomePage;