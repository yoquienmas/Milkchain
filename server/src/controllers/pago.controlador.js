import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { pool } from './db.js'; // Ajustar ruta según tu estructura

// 1. Método del Paso 5.1
const crearPedido = async (Total, id_usuario, id_metodo_pago) => {
    const [pedido] = await pool.query(
        "INSERT INTO pedido (fecha, id_estado, Total, id_usuario, id_metodo_pago) VALUES (NOW(), 1, ?, ?, ?)",
        [Total, id_usuario, id_metodo_pago]
    );
    return pedido.insertId;
};

// 2. Método del Paso 5.2
const registrarDetalles = async (pedidoId, detalles) => {
    const detallesValues = detalles.map(d => [d.Precio_Unitario || d.precio, d.Cantidad || d.cantidad, d.id_producto || d.id, pedidoId]);
    await pool.query(
        "INSERT INTO pedido_detalles (Precio_Unitario, Cantidad, id_producto, id_pedido) VALUES ?",
        [detallesValues]
    );
};

// 3. Método del Paso 5.3
const descontarStock = async (detalles) => {
    for (const item of detalles) {
        const cantidad = item.Cantidad || item.cantidad;
        const id_producto = item.id_producto || item.id;
        await pool.query(
            "UPDATE producto SET stock = stock - ? WHERE id_producto = ?",
            [cantidad, id_producto]
        );
    }
};

// Orquestador de la ruta del API que manda a llamar a las sub-operaciones orientadas a objetos
export const finalizarPedido = async (req, res) => {
    const { id_usuario, id_metodo_pago, Total, detalles } = req.body;
    try {
        // Paso 5.1
        const pedidoId = await crearPedido(Total, id_usuario, id_metodo_pago);
        
        // Paso 5.2
        await registrarDetalles(pedidoId, detalles);
        
        // Paso 5.3
        await descontarStock(detalles);

        res.json({ success: true, message: "Pedido procesado correctamente", pedidoId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 4. Método del Paso 6.1 (Renombrado de descargarFactura a imprimirFactura)
export const imprimirFactura = (pedido, detalles, user) => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text(`Factura N° ${pedido.id_pedido || pedido.id || 'N/A'}`, 20, 20);
    doc.setFontSize(12);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, 30);
    
    doc.text("Datos del Cliente", 20, 50);
    doc.text(`Nombre: ${user?.nombre || 'Cliente'} ${user?.apellido || ''}`, 20, 60);

    // Lógica interna para rellenar la tabla del pdf...
    doc.save(`factura_${pedido.id_pedido || 'pedido'}.pdf`);
};