import { Routes, Route, Navigate } from "react-router-dom";
import BarraNavegacion from "./components/BarraNavegacion.jsx";
import PiePagina from "./components/PiePagina.jsx";
import InicioSesionPagina from "./pages/InicioSesionPagina.jsx";
import RegistroPagina from "./pages/RegistroPagina.jsx";
import PáginaPrincipal from "./pages/PáginaPrincipal.jsx";
import CatalogoPagina from "./pages/CatalogoPagina.jsx";
import CarritoPagina from "./pages/CarritoPagina.jsx";
import PedidoPagina from "./pages/PedidoPagina.jsx"; 
import { ProtectorRuta } from "./components/ProtectorRuta.jsx";

function App() {
  return (
    <>
      {/* 1. Cambiado de <Navbar /> a <BarraNavegacion /> */}
      <BarraNavegacion />
      
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/login" element={<InicioSesionPagina />} />
          <Route path="/register" element={<RegistroPagina />} />
          
          <Route element={<ProtectorRuta />}>
            <Route path="/" element={<PáginaPrincipal />} />
            <Route path="/home" element={<PáginaPrincipal />} />
            <Route path="/ver_catalogo" element={<CatalogoPagina />} />
            <Route path="/cart" element={<CarritoPagina />} />
            <Route path="/mis-pedidos" element={<PedidoPagina />} /> 
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      {/* 2. Cambiado de <Footer /> a <PiePagina /> */}
      <PiePagina />
    </>
  );
}

export default App;