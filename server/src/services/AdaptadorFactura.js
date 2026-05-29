/**
 * ========================================================================
 *                   PATRÓN DE DISEÑO ESTRUCTURAL: ADAPTADOR (GoF)
 * ========================================================================
 * 
 * PROPÓSITO DEL PATRÓN:
 * Convertir la interfaz de una clase o librería externa en otra interfaz que el cliente
 * (nuestra aplicación) espera. Permite que clases con interfaces incompatibles cooperen juntas.
 * 
 * JUSTIFICACIÓN EN NUESTRO PROYECTO (MILKCHAIN):
 * Inicialmente, las llamadas a la librería "jsPDF" y a la función nativa "window.print()"
 * estaban dispersas y acopladas directamente en las pantallas de React (CarritoPagina y PedidoPagina).
 * Si en el futuro cambiamos la biblioteca de generación de PDFs por otra más avanzada,
 * tendríamos que modificar múltiples componentes visuales, violando el principio de responsabilidad única.
 * 
 * Con este adaptador:
 * 1) Definimos una clase base abstracta "ImpresorFactura" que establece el contrato unificado.
 * 2) Creamos "AdaptadorJsPDF" que traduce las llamadas al lenguaje de coordenadas de jsPDF.
 * 3) Creamos "AdaptadorWindowPrint" que adapta las llamadas a la impresión de pantalla nativa de HTML.
 * 
 * El cliente (React) solo conoce el método unificado: .imprimir(pedido, usuario, items)
 */

import jsPDF from "jspdf";

// =========================================================================
// 1. CLASE Abstracta
// =========================================================================
export class ImpresorFactura {
  /**
   * Método de impresión unificado.
   * @param {Object} pedido - Datos del pedido (ID, fecha, dirección, total).
   * @param {Object} usuario - Datos del cliente autenticado.
   * @param {Array} items - Listado de productos en el pedido.
   */
  imprimir(pedido, usuario, items) {
    throw new Error("El método imprimir() debe ser implementado obligatoriamente por las subclases");
  }
}

// =========================================================================
// 2. ADAPTADOR CONCRETO: jsPDF (Generador de archivos PDF descargables)
// =========================================================================
export class AdaptadorJsPDF extends ImpresorFactura {
  constructor() {
    super();
  }

  /**
   * Función auxiliar interna para formatear precios al estilo es-AR (Punto para miles, coma para decimales)
   */
  _formatearPrecio(valor) {
    const numero = parseFloat(valor) || 0;
    const partes = numero.toFixed(2).split('.');
    partes[0] = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return partes.join(',');
  }

  /**
   * Adapta e implementa la llamada unificada usando las funciones internas y coordenadas de jsPDF
   */
  imprimir(pedido, usuario, items) {
    try {
      console.log("AdaptadorJsPDF: Iniciando generación de PDF...");
      
      const doc = new jsPDF();
      
      // Encabezado principal del PDF
      doc.setFontSize(18);
      doc.text("Factura de Compra - MilkChain", 20, 20);
      
      // Metadatos de la factura
      doc.setFontSize(12);
      const fechaFormateada = new Date(pedido.fecha || Date.now()).toLocaleDateString();
      doc.text(`Fecha: ${fechaFormateada}`, 20, 30);
      doc.text(`Cliente: ${usuario?.nombre || "Consumidor"} ${usuario?.apellido || "Final"}`, 20, 40);
      
      // Obtener dirección de envío de forma tolerante a fallos
      const calle = pedido.calle || "";
      const numero = pedido.numero || "";
      if (calle) {
        doc.text(`Dirección de Entrega: ${calle} ${numero}`, 20, 50);
      }
      
      doc.text("Detalle de la compra:", 20, 70);
      
      // Dibujar la tabla de items de forma dinámica
      let y = 80;
      items.forEach((item) => {
        const cantidad = item.cantidad || item.Cantidad || 1;
        const precioUnitario = item.precio || item.precio_unitario || item.Precio_Unitario || 0;
        const subtotal = (precioUnitario * cantidad).toFixed(2);
        
        doc.text(`${cantidad}x ${item.nombre} - $${subtotal}`, 20, y);
        y += 10;
      });

      // Total de la Factura
      const montoTotal = pedido.Total || pedido.total || 0;
      doc.setFontSize(14);
      doc.text(`Total Abonado: $${this._formatearPrecio(montoTotal)}`, 20, y + 10);
      
      // Guardar el PDF de forma dinámica
      const idFactura = pedido.id_pedido || pedido.id || "reciente";
      doc.save(`Factura_MilkChain_#${idFactura}.pdf`);
      console.log("AdaptadorJsPDF: PDF generado y guardado con éxito.");
    } catch (error) {
      console.error("Error crítico en AdaptadorJsPDF, aplicando fallback nativo:", error);
      // Fallback: Si jsPDF llegase a fallar, disparamos la impresión del navegador para no arruinar la experiencia
      window.print();
    }
  }
}

// =========================================================================
// 3. ADAPTADOR CONCRETO: Impresión Nativa (Lanza la ventana del navegador)
// =========================================================================
export class AdaptadorWindowPrint extends ImpresorFactura {
  constructor() {
    super();
  }

  /**
   * Adapta la llamada unificada redirigiéndola al flujo de impresión nativo del navegador
   */
  imprimir(pedido, usuario, items) {
    console.log("AdaptadorWindowPrint: Abriendo cuadro de diálogo de impresión nativo...", { pedido, usuario, items });
    window.print();
  }
}
