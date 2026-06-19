import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { pool } from '../db.js';

// 1. Método del Paso 5.1
export const crearPedido = async (connection, Total, id_usuario, id_metodo_pago) => {
    const [pedido] = await connection.query(
        "INSERT INTO pedido (fecha, id_estado, Total, id_usuario, id_metodo_pago) VALUES (NOW(), 1, ?, ?, ?)",
        [Total, id_usuario, id_metodo_pago]
    );
    return pedido.insertId;
};

// 2. Método del Paso 5.2
const registrarDetalles = async (connection, pedidoId, detalles) => {
    const detallesValues = detalles.map(d => [
        parseFloat(d.Precio_Unitario || d.precio || 0), 
        parseInt(d.Cantidad || d.cantidad || 1), 
        parseInt(d.id_producto || d.id), 
        pedidoId
    ]);
    
    await connection.query(
        "INSERT INTO pedido_detalles (Precio_Unitario, Cantidad, id_producto, id_pedido) VALUES ?",
        [detallesValues]
    );
};

// 3. Método del Paso 5.3
const descontarStock = async (connection, detalles) => {
    for (const item of detalles) {
        const cantidad = parseInt(item.Cantidad || item.cantidad || 1);
        const id_producto = parseInt(item.id_producto || item.id);
        await connection.query(
            "UPDATE producto SET stock = stock - ? WHERE id_producto = ?",
            [cantidad, id_producto]
        );
    }
};

// 5.0 Validar que haya stock suficiente antes de crear el pedido
const validarStockDisponibilidad = async (connection, detalles) => {
  for (const item of detalles) {
    const cantidad = parseInt(item.Cantidad || item.cantidad || 1);
    const id_producto = parseInt(item.id_producto || item.id);
    const [[row]] = await connection.query(
      `SELECT stock FROM producto WHERE id_producto = ?`,
      [id_producto]
    );
    const stockActual = row?.stock ?? 0;
    if (stockActual < cantidad) {
      throw new Error(`Stock insuficiente para el producto ID ${id_producto}. Disponible: ${stockActual}, solicitado: ${cantidad}`);
    }
  }
};

// Orquestador de la ruta del API
export const finalizarPedido = async (req, res) => {
    const { id_usuario, id_metodo_pago, Total, detalles } = req.body;
    const metodoPagoId = id_metodo_pago || req.body.id_pago;

    if (!id_usuario || !metodoPagoId || !detalles || !detalles.length) {
        return res.status(400).json({ message: "Faltan datos requeridos para procesar el pedido" });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Paso 5.0 - Validar stock ANTES de insertar nada
        await validarStockDisponibilidad(connection, detalles);

        // Paso 5.1 - Crear cabecera del pedido
        const pedidoId = await crearPedido(connection, Total, id_usuario, metodoPagoId);
        
        // Paso 5.2 - Registrar los detalles del pedido
        await registrarDetalles(connection, pedidoId, detalles);
        
        // Paso 5.3 - Descontar stock
        await descontarStock(connection, detalles);

        await connection.commit();
        res.status(201).json({ success: true, message: "Pedido registrado y stock actualizado con éxito", id: pedidoId });
    } catch (error) {
        await connection.rollback();
        console.error("Error en finalizarPedido:", error);
        res.status(500).json({ message: "Error en el servidor al registrar el pedido: " + error.message });
    } finally {
        connection.release();
    }
};

// Guardar una nueva dirección (Operación guardarDireccion)
export const guardarDireccion = async (req, res) => {
    const { calle, numero, telefono, id_localidad, id_usuario } = req.body;

    if (!calle || !numero || !telefono || !id_localidad || !id_usuario) {
        return res.status(400).json({ message: "Campos no válidos" });
    }

    try {
        const [result] = await pool.query(
            `INSERT INTO direccion (calle, numero, id_telefono, id_localidad, id_usuario, activo) 
             VALUES (?, ?, ?, ?, ?, 1)`,
            [calle, numero, telefono, id_localidad, id_usuario]
        );
        
        res.status(201).json({ id: result.insertId });
    } catch (error) {
        console.error("Error al guardar dirección:", error);
        res.status(500).json({ error: "Error al guardar en base de datos" });
    }
};

// Actualizar el estado de un pedido (Operación actualizarEstado)
export const actualizarEstado = async (req, res) => {
    const { id } = req.params;
    const { nuevoEstadoId } = req.body;

    if (nuevoEstadoId === undefined || nuevoEstadoId === null || nuevoEstadoId === "") {
        return res.status(400).json({ message: "Campos no válidos" });
    }

    try {
        const [rows] = await pool.query('SELECT id_estado FROM pedido WHERE id_pedido = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "Pedido no encontrado" });
        }

        const estadoActualId = rows[0].id_estado;
        if (Number(estadoActualId) === Number(nuevoEstadoId)) {
            return res.status(400).json({ message: "El pedido ya se encuentra en ese estado" });
        }

        await pool.query('UPDATE pedido SET id_estado = ?, fecha_modificacion = NOW() WHERE id_pedido = ?', [nuevoEstadoId, id]);
        res.json({ message: "Estado actualizado correctamente", id_estado: nuevoEstadoId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al cambiar el estado" });
    }
};

// Método de Impresión Factura PDF
export const imprimirFactura = (pedido, detalles, user) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Factura N° ${pedido.id_pedido || pedido.id || 'N/A'}`, 20, 20);
    doc.setFontSize(12);
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, 30);
    
    doc.text("Datos del Cliente", 20, 50);
    doc.text(`Nombre: ${user?.nombre || 'Cliente'} ${user?.apellido || ''}`, 20, 60);

    doc.save(`factura_${pedido.id_pedido || 'pedido'}.pdf`);
};