/**
 * ========================================================================
 *              PATRÓN DE DISEÑO ESTRUCTURAL: ADAPTADOR DE OBJETOS (GoF)
 * ========================================================================
 * 
 * PROPÓSITO DEL PATRÓN:
 * Convertir la interfaz incompatible de una clase existente o API externa (Adaptee)
 * en una interfaz común (Target) que el código cliente espera recibir.
 * 
 * ESTRUCTURA CLÁSICA DE ADAPTADOR DE OBJETOS:
 * 1. Target (Interfaz Objetivo): ImpresorFactura. Clase base que define el contrato común.
 * 2. Adaptee (Sistema Incompatible): SistemaPdfExterno y SistemaImpresionNativa. Contienen
 *    la lógica específica y firmas de métodos incompatibles con el resto de la app.
 * 3. Adapter (Adaptador): AdaptadorJsPDF y AdaptadorWindowPrint. Heredan de la clase base
 *    Target e inyectan una instancia del Adaptee por composición (constructor), delegando
 *    el método esperado al método específico interno.
 */

import jsPDF from "jspdf";

// =========================================================================
// 1. TARGET INTERFACE (Interfaz común esperada por el cliente React)
// =========================================================================
export class ImpresorFactura {
  /**
   * Método de impresión unificado
   * @param {Object} pedido - Datos del pedido
   * @param {Object} usuario - Datos del usuario
   * @param {Array} items - Listado de productos
   */
  imprimir(pedido, usuario, items) {
    throw new Error("El método imprimir() debe ser implementado obligatoriamente por las subclases");
  }
}

// =========================================================================
// 2. ADAPTEES (Sistemas existentes con interfaces e implementaciones incompatibles)
// =========================================================================

/**
 * Adaptee A: Generador de PDF usando la librería externa jsPDF
 */
export class SistemaPdfExterno {
  /**
   * Método de firma incompatible que requiere procesamiento específico
   */
  generarDocumentoPdf(pedido, usuario, items) {
    console.log("SistemaPdfExterno: Ejecutando generación de documento PDF...");
    const doc = new jsPDF();
    
    // Encabezado
    doc.setFontSize(18);
    doc.text("Factura de Compra - MilkChain", 20, 20);
    
    // Metadatos
    doc.setFontSize(12);
    const fechaFormateada = new Date(pedido.fecha || Date.now()).toLocaleDateString();
    doc.text(`Fecha: ${fechaFormateada}`, 20, 30);
    doc.text(`Cliente: ${usuario?.nombre || "Consumidor"} ${usuario?.apellido || "Final"}`, 20, 40);
    
    const calle = pedido.calle || "";
    const numero = pedido.numero || "";
    if (calle) {
      doc.text(`Dirección de Entrega: ${calle} ${numero}`, 20, 50);
    }
    
    doc.text("Detalle de la compra:", 20, 70);
    
    // Grilla
    let y = 80;
    items.forEach((item) => {
      const cantidad = item.cantidad || item.Cantidad || 1;
      const precioUnitario = item.precio || item.precio_unitario || item.Precio_Unitario || 0;
      const subtotal = (precioUnitario * cantidad).toFixed(2);
      
      doc.text(`${cantidad}x ${item.nombre} - $${subtotal}`, 20, y);
      y += 10;
    });

    // Formatear total
    const totalAbonado = parseFloat(pedido.Total || pedido.total || 0).toFixed(2);
    doc.setFontSize(14);
    doc.text(`Total Abonado: $${totalAbonado.replace(".", ",")}`, 20, y + 10);
    
    const idFactura = pedido.id_pedido || pedido.id || "reciente";
    doc.save(`Factura_MilkChain_#${idFactura}.pdf`);
    console.log("SistemaPdfExterno: PDF generado con éxito.");
  }
}

/**
 * Adaptee B: Sistema de Impresión Nativo de Pantalla HTML (window.print)
 */
export class SistemaImpresionNativa {
  /**
   * Método de firma incompatible sin argumentos
   */
  lanzarImpresionPantalla() {
    console.log("SistemaImpresionNativa: Abriendo diálogo de impresión del navegador...");
    window.print();
  }
}

// =========================================================================
// 3. ADAPTERS (Clases adaptadoras que envuelven por composición al Adaptee)
// =========================================================================

/**
 * Adaptador para jsPDF (Object Adapter)
 */
export class AdaptadorJsPDF extends ImpresorFactura {
  /**
   * @param {SistemaPdfExterno} sistemaPdf - Inyección del sistema incompatible por composición
   */
  constructor(sistemaPdf) {
    super();
    this.sistemaPdf = sistemaPdf;
  }

  /**
   * Adapta el método uniforme "imprimir" delegando la ejecución en el método específico
   */
  imprimir(pedido, usuario, items) {
    if (!this.sistemaPdf) {
      throw new Error("SistemaPdfExterno no inicializado en el adaptador");
    }
    this.sistemaPdf.generarDocumentoPdf(pedido, usuario, items);
  }
}

/**
 * Adaptador para Impresión Nativa (Object Adapter)
 */
export class AdaptadorWindowPrint extends ImpresorFactura {
  /**
   * @param {SistemaImpresionNativa} sistemaNativo - Inyección del sistema nativo por composición
   */
  constructor(sistemaNativo) {
    super();
    this.sistemaNativo = sistemaNativo;
  }

  /**
   * Adapta el método uniforme "imprimir" delegando la ejecución en el método específico nativo
   */
  imprimir(pedido, usuario, items) {
    if (!this.sistemaNativo) {
      throw new Error("SistemaImpresionNativa no inicializado en el adaptador");
    }
    this.sistemaNativo.lanzarImpresionPantalla();
  }
}
