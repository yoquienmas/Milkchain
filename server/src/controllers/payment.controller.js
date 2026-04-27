import jsPDF from 'jspdf';
import 'jspdf-autotable';
// auth.controller.js o pedidos.controller.js
export const finalizarPedido = async (req, res) => {
    const { idUsuario, idDireccion, idPago, total, detalles } = req.body;

    try {
        // 1. Crear el registro en la tabla 'pedido'
        const [pedido] = await pool.query(
            "INSERT INTO pedido (fecha, estado, total, idUsuario, idDireccion, idPago) VALUES (NOW(), 'En preparación', ?, ?, ?, ?)",
            [total, idUsuario, idDireccion, idPago]
        );

        const pedidoId = pedido.insertId;

        // 2. Mover los productos del carrito a 'pedidodetalles'
        const detallesValues = detalles.map(d => [d.precio, d.cantidad, d.id_Producto, pedidoId]);
        await pool.query(
            "INSERT INTO pedidodetalles (p_Unitario, cantidad, id_Producto, id_Pedido) VALUES ?",
            [detallesValues]
        );

        // 3. Limpiar el carrito del usuario
        await pool.query("DELETE FROM carritodetalles WHERE id_Carrito = (SELECT id FROM carrito WHERE id_Usuario = ?)", [idUsuario]);

        res.json({ message: "Pago exitoso", pedidoId });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const descargarFactura = (pedido, detalles) => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text(`Factura N° ${pedido.id}`, 20, 20);
    doc.setFontSize(12);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, 30);
    
    // Datos del Cliente
    doc.text("Datos del Cliente", 20, 50);
    doc.text(`Nombre: ${user.nombre} ${user.apellido}`, 20, 60);

    // Tabla de productos
    doc.autoTable({
        startY: 80,
        head: [['Producto', 'Cantidad', 'Precio Unitario', 'Subtotal']],
        body: detalles.map(d => [d.nombre, d.cantidad, `$${d.precio}`, `$${d.precio * d.cantidad}`]),
    });

    doc.text(`Total a Pagar: $${pedido.total}`, 140, doc.lastAutoTable.finalY + 10);
    doc.save(`Factura_MilkChain_${pedido.id}.pdf`);
};