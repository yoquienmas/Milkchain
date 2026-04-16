import { Link } from "react-router-dom";

function HomePage() {

  return (
    <div className="home-container">
  
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