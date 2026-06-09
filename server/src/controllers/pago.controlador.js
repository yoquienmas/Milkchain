import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { pool } from '../db.js';

class CustomError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}

// 1. Método del Paso 5.1
export const crearPedido = async (connection, Total, id_usuario, id_metodo_pago) => {
    const [pedido] = await connection.query(
        "INSERT INTO pedido (fecha, id_estado, Total, id_usuario, id_metodo_pago) VALUES (NOW(), 1, ?, ?, ?)",
        [Total, id_usuario, id_metodo_pago]
    );
    return pedido.insertId;
};

// 2. Método del Paso 5.2
export const registrarDetalles = async (connection, pedidoId, detalles) => {
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
export const descontarStock = async (connection, detalles) => {
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
export const validarStockDisponibilidad = async (connection, detalles) => {
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

// =====================================================================================
//  METODOS PUROS DE OPERACIONES CRÍTICAS (CONTRATO DE NEGOCIO)
// =====================================================================================

export const finalizarPedidoMetodo = async (id_usuario, id_metodo_pago, Total, detalles) => {
    if (!id_usuario || !id_metodo_pago || !detalles || !detalles.length) {
        throw new CustomError("Faltan datos requeridos para procesar el pedido", 400);
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Paso 5.1
        const pedidoId = await crearPedido(connection, Total, id_usuario, id_metodo_pago);
        
        // Paso 5.2
        await registrarDetalles(connection, pedidoId, detalles);
        
        // Paso 5.3
        await validarStockDisponibilidad(connection, detalles);
        await descontarStock(connection, detalles);

        await connection.commit();
        return { success: true, message: "Pedido registrado y stock actualizado con éxito", id: pedidoId };
    } catch (error) {
        await connection.rollback();
        throw new CustomError(error.message, error.status || 500);
    } finally {
        connection.release();
    }
};

export const guardarDireccionMetodo = async (calle, numero, telefono, id_localidad, id_usuario) => {
    if (!calle || !numero || !telefono || !id_localidad || !id_usuario) {
        throw new CustomError("Campos no válidos", 400);
    }

    try {
        const [result] = await pool.query(
            `INSERT INTO direccion (calle, numero, id_telefono, id_localidad, id_usuario, activo) 
             VALUES (?, ?, ?, ?, ?, 1)`,
            [calle, numero, telefono, id_localidad, id_usuario]
        );
        
        return { id: result.insertId };
    } catch (error) {
        throw new CustomError("Error al guardar en base de datos", 500);
    }
};

export const actualizarEstadoMetodo = async (id, nuevoEstadoId) => {
    if (nuevoEstadoId === undefined || nuevoEstadoId === null || nuevoEstadoId === "") {
        throw new CustomError("Campos no válidos", 400);
    }

    try {
        const [rows] = await pool.query('SELECT id_estado FROM pedido WHERE id_pedido = ?', [id]);
        if (rows.length === 0) {
            throw new CustomError("Pedido no encontrado", 404);
        }

        const estadoActualId = rows[0].id_estado;
        if (Number(estadoActualId) === Number(nuevoEstadoId)) {
            throw new CustomError("El pedido ya se encuentra en ese estado", 400);
        }

        await pool.query('UPDATE pedido SET id_estado = ?, fecha_modificacion = NOW() WHERE id_pedido = ?', [nuevoEstadoId, id]);
        return { message: "Estado actualizado correctamente", id_estado: nuevoEstadoId };
    } catch (error) {
        if (error instanceof CustomError) throw error;
        throw new CustomError("Error al cambiar el estado", 500);
    }
};

// =====================================================================================
//  CONTROLADORES / HTTP ENDPOINTS (Llaman a los métodos puros)
// =====================================================================================

export const finalizarPedido = async (req, res) => {
    const { id_usuario, id_metodo_pago, Total, detalles } = req.body;
    const metodoPagoId = id_metodo_pago || req.body.id_pago;

    try {
        const result = await finalizarPedidoMetodo(id_usuario, metodoPagoId, Total, detalles);
        res.status(201).json(result);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
};

export const guardarDireccion = async (req, res) => {
    const { calle, numero, telefono, id_localidad, id_usuario } = req.body;

    try {
        const result = await guardarDireccionMetodo(calle, numero, telefono, id_localidad, id_usuario);
        res.status(201).json(result);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
};

export const actualizarEstado = async (req, res) => {
    const { id } = req.params;
    const { nuevoEstadoId } = req.body;

    try {
        const result = await actualizarEstadoMetodo(id, nuevoEstadoId);
        res.json(result);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message });
    }
};

// 4. Método del Paso 6.1 (Impresión Factura PDF)
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