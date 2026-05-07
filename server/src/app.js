import express from 'express';
import morgan from "morgan";
import 'dotenv/config';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import productRoutes from './routes/product.routes.js';
import authRoutes from './routes/auth.routes.js'; 
import { pool } from './db.js';

const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
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
app.get('/api/direcciones', async (req, res) => {
    try {
        const id_usuario_actual = []; 

        const [rows] = await pool.query(
            // Importante: id_usuario en minúscula según tu SQL
            'SELECT * FROM direccion WHERE id_usuario = ? ORDER BY id_direccion DESC', 
            [id_usuario_actual]
        ); 
        
        res.json(rows);
    } catch (error) {
        console.error("Error en /direcciones:", error);
        res.status(500).json({ error: "Error al obtener direcciones" });
    }
});

// 5. Guardar una nueva dirección (POST)
app.get('/api/pagos', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id_pago AS id, nombre FROM pago WHERE activo = 1');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener métodos de pago" });
    }
});

// --- RUTA PARA FINALIZAR COMPRA CON DESCUENTO DE STOCK ---
app.post('/api/pedidos', async (req, res) => {
    const { id_usuario, id_direccion, id_pago, total, detalles } = req.body;
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // id_pago ahora referencia a id_pago en la tabla pago
        const [pedidoRes] = await connection.query(
            'INSERT INTO pedido (fecha, total, id_usuario, id_direccion, id_pago, estado) VALUES (NOW(), ?, ?, ?, ?, ?)',
            [total, id_usuario, id_direccion, id_pago, 'Pendiente']
        );
        const pedidoId = pedidoRes.insertId;

        for (const item of detalles) {
            await connection.query(
                'INSERT INTO pedido_detalles (cantidad, precio_unitario, id_Producto, id_Pedido) VALUES (?, ?, ?, ?)',
                [item.cantidad, item.precio, item.id_producto, pedidoId]
            );

            // id_producto en minúscula
            const [updateRes] = await connection.query(
                'UPDATE producto SET stock = stock - ? WHERE id_producto = ? AND stock >= ?',
                [item.cantidad, item.id_producto, item.cantidad]
            );

            if (updateRes.affectedRows === 0) throw new Error(`Sin stock para el producto ${item.id_producto}`);
        }

        await connection.commit();
        res.status(201).json({ idPedido: pedidoId });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
});

// --- RUTAS DE PEDIDOS PARA LA VISTA "MIS PEDIDOS" ---

// 1. Obtener todos los pedidos de un usuario
// Mis Pedidos (id_pedido e id_pago en minúsculas)
app.get('/api/pedidos/:id_usuario', async (req, res) => {
    const { id_usuario } = req.params;
    try {
        const [rows] = await pool.query(
            `SELECT p.id_pedido, p.fecha, p.total, p.estado, pag.nombre as metodo_pago 
             FROM pedido p 
             JOIN pago pag ON p.id_pago = pag.id_pago 
             WHERE p.id_usuario = ? 
             ORDER BY p.id_pedido DESC`, 
            [id_usuario]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener pedidos" });
    }
});

// 2. Obtener los detalles de un pedido específico
app.get('/api/pedidos/detalle/:id_pedido', async (req, res) => {
    const { id_pedido } = req.params;
    try {
        const [rows] = await pool.query(
            `SELECT pd.*, pr.nombre 
             FROM pedido_detalles pd 
             JOIN producto pr ON pd.id_Producto = pr.id_producto 
             WHERE pd.id_Pedido = ?`, // 'pedido_detalles' con _ y 'id_producto'
            [id_pedido]
        );
        res.json(rows);
    } catch (error) {
        console.error("Error al obtener detalle:", error);
        res.status(500).json({ error: "Error al obtener el detalle del pedido" });
    }
});
// --- RUTAS DE ADMINISTRACIÓN DE PEDIDOS ---

// 1. Eliminar un pedido
app.delete('/api/pedidos/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Cambiar pedidodetalles por pedido_detalles
        await pool.query('DELETE FROM pedido_detalles WHERE id_Pedido = ?', [id]);
        await pool.query('DELETE FROM pedido WHERE id_pedido = ?', [id]); // id_pedido
        res.json({ message: "Pedido eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar el pedido" });
    }
});

// 2. Editar datos del pedido
app.put('/api/pedidos/:id', async (req, res) => {
    const { id } = req.params;
    const { fecha, total, idUsuario, estado } = req.body;
    try {
        await pool.query(
            'UPDATE pedido SET fecha = ?, total = ?, idUsuario = ?, estado = ? WHERE id = ?',
            [fecha, total, idUsuario, estado, id]
        );
        res.json({ message: "Pedido actualizado" });
    } catch (error) {
        res.status(500).json({ error: "Error al actualizar" });
    }
});

// 3. Cambiar estado automáticamente (Ciclo: Pendiente -> Enviado -> Entregado)
app.patch('/api/pedidos/estado/:id', async (req, res) => {
    const { id } = req.params;
    const { nuevoEstado } = req.body;
    try {
        await pool.query('UPDATE pedido SET estado = ? WHERE id = ?', [nuevoEstado, id]);
        res.json({ message: "Estado actualizado", estado: nuevoEstado });
    } catch (error) {
        res.status(500).json({ error: "Error al cambiar el estado" });
    }
});

// Agregá esto a index.js
app.get('/api/pedidos/all', async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT p.id_pedido, p.fecha, p.total, p.estado, pag.nombre as metodo_pago, u.nombre as nombre_usuario
             FROM pedido p 
             JOIN pago pag ON p.id_pago = pag.id_pago
             JOIN usuario u ON p.id_usuario = u.id
             ORDER BY p.fecha DESC`
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener todos los pedidos" });
    }
});
export default app;