import { Routes, Route, Navigate } from "react-router-dom";
import NavbarSelector from "./components/NavbarSelector.jsx";
import PiePagina from "./components/PiePagina.jsx";
import InicioSesionPagina from "./pages/InicioSesionPagina.jsx";
import RegistroPagina from "./pages/RegistroPagina.jsx";
import PáginaPrincipal from "./pages/PaginaPrincipal.jsx";
import CatalogoPagina from "./pages/CatalogoPagina.jsx";
import CarritoPagina from "./pages/CarritoPagina.jsx";
import PedidoPagina from "./pages/PedidoPagina.jsx"; 
import { ProtectorRuta, ProtectorCliente } from "./components/ProtectorRuta.jsx";

function App() {
  return (
    <>
      <NavbarSelector /> {/* Ahora decide dinámicamente */}
      
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/login" element={<InicioSesionPagina />} />
          <Route path="/register" element={<RegistroPagina />} />
          
          <Route element={<ProtectorRuta />}>
            <Route path="/" element={<PáginaPrincipal />} />
            <Route path="/home" element={<PáginaPrincipal />} />
            <Route path="/mis-pedidos" element={<PedidoPagina />} /> 

            {/* Rutas accesibles únicamente por clientes */}
            <Route element={<ProtectorCliente />}>
              <Route path="/ver_catalogo" element={<CatalogoPagina />} />
              <Route path="/cart" element={<CarritoPagina />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      <PiePagina />
    </>
  );
}

export default App;