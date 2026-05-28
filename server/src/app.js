import express from 'express';
import morgan from "morgan";
import path from 'path';
import 'dotenv/config';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import productRoutes from './routes/producto.rutas.js';
import authRoutes from './routes/autenticacion.rutas.js'; 
import { pool } from './db.js';

const app = express();
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));
app.use(morgan('dev'));
app.use(express.static('public'));
app.use(cookieParser());

// Rutas de módulos existentes
app.use('/api', authRoutes);
app.use('/api', productRoutes); 

// --- RUTAS DE GEOGRAFÍA PARA MILKCHAIN ---

// 1. Obtener todos los países
app.get('/api/paises', async (req, res) => {
    try {
        // Usamos id_pais como id para que el frontend lo reconozca fácil
        const [rows] = await pool.query('SELECT id_pais AS id, nombre FROM pais WHERE activo = 1');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener países" });
    }
});

// 2. Provincias por país (id_pais en minúscula)
app.get('/api/provincias/:id_pais', async (req, res) => {
    const { id_pais } = req.params;
    try {
        const [rows] = await pool.query('SELECT id_provincia as id, nombre FROM provincia WHERE id_Pais = ?', [id_pais]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: "Error al cargar provincias" });
    }
});

// 3. Localidades (id_localidad e id_provincia en minúscula)
app.get('/api/localidades/:id_provincia', async (req, res) => {
    const { id_provincia } = req.params;
    try {
        const [rows] = await pool.query('SELECT id_localidad as id, nombre FROM localidad WHERE id_provincia = ?', [id_provincia]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: "Error al cargar localidades" });
    }
});

// 4. Obtener direcciones
// BUSCAR ESTA PARTE EN TU index.js Y REEMPLAZARLA:
app.get('/api/direcciones/:id_usuario', async (req, res) => {
    const { id_usuario } = req.params; // Captura el ID que viene de la URL
    try {
        const [rows] = await pool.query(
            'SELECT * FROM direccion WHERE id_usuario = ?', 
            [id_usuario]
        ); 
        res.json(rows); // Si no tiene, devolverá [] y aparecerá el formulario
    } catch (error) {
        res.status(500).json({ error: "Error al obtener direcciones" });
    }
});
app.get('/api/pagos', async (req, res) => {
    try {
        // Ajustamos la consulta al nombre real de la tabla y sus columnas
        const [rows] = await pool.query('SELECT id_metodo_pago AS id, nombre FROM metodo_pago WHERE activo = 1');
        res.json(rows);
    } catch (error) {
        console.error("Error al obtener pagos:", error);
        res.status(500).json({ error: "Error al consultar la base de datos" });
    }
});

// --- GUARDAR NUEVA DIRECCIÓN (POST) ---
app.post('/api/direcciones', async (req, res) => {
    // Asegúrate de que 'telefono' venga desde el frontend
    const { calle, numero, telefono, id_localidad, id_usuario } = req.body;

    try {
        // CAMBIO AQUÍ: Usamos 'id_telefono' en lugar de 'n_contacto'
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
});


// ==========================================
//    RUTAS DE ADMINISTRACIÓN DE PEDIDOS
// ==========================================

// 1. PRIMERO SIEMPRE LAS RUTAS FIJAS ESPECÍFICAS
// Obtener TODOS los pedidos (Para el Administrador)
app.get('/api/pedidos/all', async (req, res) => {
    try {
        console.log("Consultando todos los pedidos para el admin con DNI...");
        const [rows] = await pool.query(`
            SELECT 
                p.id_pedido, 
                p.fecha, 
                p.Total, 
                e.nombre as estado, 
                u.nombre as nombre_usuario, 
                u.apellido as apellido_usuario,
                u.dni as dni_usuario
            FROM pedido p
            LEFT JOIN estado e ON p.id_estado = e.id_estado
            LEFT JOIN usuario u ON p.id_usuario = u.id_usuario
            ORDER BY p.fecha DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error("Error en /api/pedidos/all:", error);
        res.status(500).json({ error: error.message });
    }
});

// 2. Ruta para GUARDAR un pedido (POST)
app.post('/api/pedidos', async (req, res) => {
    const { id_usuario, id_pago, id_metodo_pago, Total, detalles } = req.body;
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();

        // En la base de datos se usa id_estado (1 es Pendiente por defecto)
        const metodoPago = id_metodo_pago || id_pago;
        const [pedido] = await connection.query(
            'INSERT INTO pedido (id_usuario, id_metodo_pago, Total, fecha, id_estado) VALUES (?, ?, ?, NOW(), 1)',
            [id_usuario, metodoPago, Total]
        );

        const id_pedido = pedido.insertId;

        for (const item of detalles) {
            const idProducto = item.id_producto || item.id;
            const cantidad = item.Cantidad || item.cantidad;
            const precioUnitario = item.Precio_Unitario || item.precio_unitario || item.precio;

            await connection.query(
                'INSERT INTO pedido_detalles (id_pedido, id_producto, Cantidad, Precio_Unitario) VALUES (?, ?, ?, ?)',
                [id_pedido, idProducto, cantidad, precioUnitario]
            );

            await connection.query(
                'UPDATE producto SET stock = stock - ? WHERE id_producto = ?',
                [cantidad, idProducto]
            );
        }

        await connection.commit();
        res.status(201).json({ message: "Pedido registrado y stock actualizado", id: id_pedido });
    } catch (error) {
        await connection.rollback();
        console.error("Error al registrar pedido:", error);
        res.status(500).json({ error: "Error en la base de datos" });
    } finally {
        connection.release();
    }
});

// 3. SEGUNDO LAS RUTAS CON PARÁMETROS DINÁMICOS (SIEMPRE AL FINAL)
// Obtener los detalles de un pedido específico
// Obtener los detalles de un pedido específico
app.get('/api/pedidos/detalle/:id_pedido', async (req, res) => {
    const { id_pedido } = req.params;
    try {
        const [rows] = await pool.query(
            `SELECT 
                pd.Precio_Unitario as precio_unitario, 
                pd.Cantidad as cantidad, 
                pr.nombre, 
                p.fecha, 
                p.Total as total_pedido, 
                u.nombre as nombre_cliente,
                u.apellido as apellido_cliente 
             FROM pedido_detalles pd 
             JOIN producto pr ON pd.id_producto = pr.id_producto 
             JOIN pedido p ON pd.id_pedido = p.id_pedido
             JOIN usuario u ON p.id_usuario = u.id_usuario
             WHERE pd.id_pedido = ?`, 
            [id_pedido]
        );
        res.json(rows);
    } catch (error) {
        // NOTA: Dejamos este console.error para que si vuelve a fallar veas el por qué real en la consola de la terminal
        console.error("Error en /api/pedidos/detalle:", error);
        res.status(500).json({ error: "Error al obtener detalle" });
    }
});

// Eliminar un pedido
app.delete('/api/pedidos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM pedido_detalles WHERE id_pedido = ?', [id]);
        await pool.query('DELETE FROM pedido WHERE id_pedido = ?', [id]);
        res.json({ message: "Pedido eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar el pedido" });
    }
});

// Editar datos del pedido
app.put('/api/pedidos/:id', async (req, res) => {
    const { id } = req.params;
    const { Total, id_estado } = req.body; 
    try {
        await pool.query(
            'UPDATE pedido SET Total = ?, id_estado = ?, fecha_modificacion = NOW() WHERE id_pedido = ?',
            [Total, id_estado, id]
        );
        res.json({ message: "Pedido actualizado con éxito" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al actualizar el pedido" });
    }
});

// Cambiar estado automáticamente
app.patch('/api/pedidos/estado/:id', async (req, res) => {
    const { id } = req.params;
    const { nuevoEstadoId } = req.body;
    try {
        await pool.query('UPDATE pedido SET id_estado = ?, fecha_modificacion = NOW() WHERE id_pedido = ?', [nuevoEstadoId, id]);
        res.json({ message: "Estado actualizado correctamente", id_estado: nuevoEstadoId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al cambiar el estado" });
    }
});

// Obtener pedidos de un usuario específico (ESTA VA ÚLTIMA DE TODO EL ARCHIVO)
app.get('/api/pedidos/:id_usuario', async (req, res) => {
    const { id_usuario } = req.params;
    try {
        const [rows] = await pool.query(
            `SELECT p.id_pedido, p.fecha, p.Total, e.nombre as estado, mp.nombre as metodo_pago 
             FROM pedido p 
             LEFT JOIN estado e ON p.id_estado = e.id_estado
             LEFT JOIN metodo_pago mp ON p.id_metodo_pago = mp.id_metodo_pago   
             WHERE p.id_usuario = ? 
             ORDER BY p.id_pedido DESC`, 
            [id_usuario]
        ); 
        res.json(rows);
    } catch (error) {
        console.error("Error en la consulta de pedidos por usuario:", error);
        res.status(500).json({ error: "Error al obtener pedidos" });
    }
});

// Eliminar un pedido
app.delete('/api/pedidos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM pedido_detalles WHERE id_pedido = ?', [id]);
        await pool.query('DELETE FROM pedido WHERE id_pedido = ?', [id]);
        res.json({ message: "Pedido eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar el pedido" });
    }
});

export default app;