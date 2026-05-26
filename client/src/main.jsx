import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/ContextoAutenticacion.jsx'
import { CartProvider } from './context/ContextoCarrito.jsx';
import { ProveedorToast } from './context/ContextoToast.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ProveedorToast> 
        <CartProvider>
          <App />
        </CartProvider>
        </ProveedorToast> 
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)