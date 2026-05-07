import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import CataloguePage from "./pages/CataloguePage";
import CartPage from "./pages/CartPage";
import OrdersPage from "./pages/OrdersPage"; // 1. IMPORTA LA PÁGINA
import { ProtectedRoute } from "./components/ProtectedRoute";
import "./App.css";

function App() {
  return (
    <>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/ver_catalogo" element={<CataloguePage />} />
            <Route path="/cart" element={<CartPage />} />
            {/* 2. AGREGA LA RUTA AQUÍ */}
            <Route path="/mis-pedidos" element={<OrdersPage />} /> 
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;