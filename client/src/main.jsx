import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/ContextoAutenticacion.jsx'
import { CartProvider } from './context/ContextoCarrito.jsx';
<<<<<<< HEAD
=======
import { ProveedorToast } from './context/ContextoToast.jsx';
>>>>>>> Rama_Front

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
<<<<<<< HEAD
          <App />
=======
          <ProveedorToast>
            <App />
          </ProveedorToast>
>>>>>>> Rama_Front
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)