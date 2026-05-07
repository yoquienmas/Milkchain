import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import CataloguePage from "./pages/CataloguePage";
import CartPage from "./pages/CartPage";
import { ProtectedRoute } from "./components/ProtectedRoute"; // Importalo!
import "./App.css";

function App() {
  return (
    <>
      <Navbar />
      
      <main style={{ flex: 1 }}>
        <Routes>
          {/* RUTAS PÚBLICAS: Cualquiera las ve */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* RUTAS PROTEGIDAS: Solo si estás logueada */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/ver_catalogo" element={<CataloguePage />} />
            <Route path="/cart" element={<CartPage />} />
          </Route>

          {/* Redirección por si escriben cualquier cosa */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      <Footer />
    </>
  );
}

export default App;