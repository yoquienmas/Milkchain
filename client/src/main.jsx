import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <BrowserRouter> {/* El ÚNICO Router debe estar acá */}
          <App />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>
)