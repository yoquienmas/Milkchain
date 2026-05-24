import React, { createContext, useContext, useState } from 'react';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';

const ContextoToast = createContext();

export function useToast() {
  const contexto = useContext(ContextoToast);
  if (!contexto) {
    throw new Error('useToast debe usarse dentro de un ProveedorToast');
  }
  return contexto;
}

export function ProveedorToast({ children }) {
  const [toasts, setToasts] = useState([]);

  const mostrarToast = (mensaje, tipo = 'success') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    
    setToasts((prev) => [...prev, { id, mensaje, tipo }]);
    
    // Auto-eliminar en 3.5 segundos
    setTimeout(() => {
      quitarToast(id);
    }, 3500);
  };

  const quitarToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ContextoToast.Provider value={{ mostrarToast }}>
      {children}
      
      {/* Contenedor flotante de notificaciones */}
      <div className="toast-container">
        {toasts.map((t) => {
          let Icono = FiCheckCircle;
          let baseClass = 'toast-card';
          
          if (t.tipo === 'error') {
            Icono = FiAlertCircle;
            baseClass += ' toast-error';
          } else if (t.tipo === 'info') {
            Icono = FiInfo;
            baseClass += ' toast-info';
          }
          
          return (
            <div key={t.id} className={baseClass}>
              <Icono className="toast-icon" />
              <span className="toast-message">{t.mensaje}</span>
              <button className="toast-close" onClick={() => quitarToast(t.id)} aria-label="Cerrar">
                <FiX />
              </button>
            </div>
          );
        })}
      </div>
    </ContextoToast.Provider>
  );
}
