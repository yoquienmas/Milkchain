import { Routes, Route } from "react-router-dom"; // ¡ESTO ES LO QUE TE FALTA!
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import CataloguePage from "./pages/CataloguePage";
import CartPage from "./pages/CartPage"; // Importalo arriba
import "./App.css";

function App() {
  return (
    <>
      {/* No necesitas AuthProvider ni CartProvider acá 
          porque ya los pusiste en main.jsx envolviendo a <App />
      */}
      <Navbar />
      
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/catalogue" element={<CataloguePage />} />
          <Route path="/cart" element={<CartPage />} />
        </Routes>
      </main>

      <Footer />
    </>
  );
}

export default App;