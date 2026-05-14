import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const finalizarPedido = async (req, res) => {
    const { id_usuario, id_metodo_pago, Total, detalles } = req.body;
    try {
        const [pedido] = await pool.query(
            "INSERT INTO pedido (fecha, estado, Total, id_usuario, id_metodo_pago) VALUES (NOW(), 'En preparación', ?, ?, ?)",
            [Total, id_usuario, id_metodo_pago]
        );
        const pedidoId = pedido.insertId;

        const detallesValues = detalles.map(d => [d.Precio_Unitario, d.Cantidad, d.id_producto, pedidoId]);
        await pool.query(
            "INSERT INTO pedido_detalles (Precio_Unitario, Cantidad, id_producto, id_pedido) VALUES ?",
            [detallesValues]
        );
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
        body: detalles.map(d => [d.nombre, d.Cantidad, `$${d.precio}`, `$${d.precio * d.Cantidad}`]),
    });

    doc.text(`Total a Pagar: $${pedido.Total}`, 140, doc.lastAutoTable.finalY + 10);
    doc.save(`Factura_MilkChain_${pedido.id}.pdf`);
};