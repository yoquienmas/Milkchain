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
  generarDocumentoPdf(pedido, usuario, items) {
    const doc = new jsPDF();
    
    // Encabezado
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Factura de Compra - MilkChain", 20, 20);
    
    // Metadatos
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const fechaFormateada = new Date().toLocaleDateString();
    doc.text(`Fecha: ${fechaFormateada}`, 20, 35);
    doc.text(`Cliente: ${usuario?.nombre || "Consumidor"}`, 20, 42);
    doc.text(`Dirección: ${pedido.calle || ""} ${pedido.numero || ""}`, 20, 49);
    
    // Encabezado de la tabla
    doc.setFont("helvetica", "bold");
    doc.setDrawColor(0);
    doc.line(20, 60, 190, 60); // Línea horizontal
    doc.text("Producto", 20, 65);
    doc.text("Cant.", 120, 65);
    doc.text("Precio", 145, 65);
    doc.text("Subtotal", 170, 65);
    doc.line(20, 68, 190, 68);
    
    // Detalles de la compra
    doc.setFont("helvetica", "normal");
    let y = 75;
    
    items.forEach((item) => {
      // FORZAR CONVERSIÓN A NÚMERO
      const cantidad = parseInt(item.cantidad) || 0;
      const precioUnitario = parseFloat(item.precio) || 0;
      const subtotal = cantidad * precioUnitario;
      
      doc.text(item.nombre || "Producto", 20, y);
      doc.text(cantidad.toString(), 125, y);
      doc.text(`$${precioUnitario.toFixed(2)}`, 145, y);
      doc.text(`$${subtotal.toFixed(2)}`, 170, y);
      
      y += 10;
    });

    // Total
    doc.line(20, y, 190, y);
    doc.setFont("helvetica", "bold");
    const totalAbonado = parseFloat(pedido.Total || 0).toFixed(2);
    doc.text(`Total: $${totalAbonado.replace(".", ",")}`, 160, y + 10);
    
    doc.save(`Factura_MilkChain_${new Date().getTime()}.pdf`);
  }
}

/**
 * Adaptee B: Sistema de Impresión Nativo de Pantalla HTML (window.print)
 */
export class SistemaImpresionNativa {
  /**
   * Método de firma incompatible sin argumentos
   */
  printNative() {
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
    this.sistemaNativo.printNative();
  }
}

// =========================================================================
// 4. CLIENT CLASS (Clase cliente que utiliza el adaptador)
// =========================================================================
export class Factura {
  /**
   * @param {ImpresorFactura} impresorFactura - Inyección de la clase adaptador por composición
   */
  constructor(impresorFactura) {
    this.impresorFactura = impresorFactura;
  }

  /**
   * Delegación uniforme de impresión
   */
  imprimirFactura(pedido, detalles, usuario) {
    this.impresorFactura.imprimir(pedido, usuario, detalles);
  }
}
