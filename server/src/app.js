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
// --- RUTAS DE PEDIDOS PARA LA VISTA "MIS PEDIDOS" ---
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
                u.nombre as nombre_cliente
             FROM pedido_detalles pd 
             JOIN producto pr ON pd.id_producto = pr.id_producto 
             JOIN pedido p ON pd.id_pedido = p.id_pedido
             JOIN usuario u ON p.id_usuario = u.id_usuario
             WHERE pd.id_pedido = ?`, 
            [id_pedido]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener detalle" });
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
    const { fecha, Total, idUsuario, estado } = req.body;
    try {
        await pool.query(
            'UPDATE pedido SET fecha = ?, Total = ?, id_usuario = ?, estado = ? WHERE id_pedido = ?',
            [fecha, Total, idUsuario, estado, id]
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
        // CAMBIO: id -> id_pedido
        await pool.query('UPDATE pedido SET estado = ? WHERE id_pedido = ?', [nuevoEstado, id]);
        res.json({ message: "Estado actualizado", estado: nuevoEstado });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al cambiar el estado" });
    }
});

// 1. PRIMERO: La ruta específica para el administrador
app.get('/api/pedidos/all', async (req, res) => {
    try {
        console.log("Consultando todos los pedidos para el admin...");
        const [rows] = await pool.query('SELECT * FROM pedido ORDER BY fecha DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});app.get('/api/pedidos/all', async (req, res) => {
    const { id_usuario } = req.params;
    try {
        const [rows] = await pool.query(
            // CAMBIO AQUÍ: Agregamos 'as total'
            `SELECT p.id_pedido, p.fecha, p.Total as total, p.estado, mp.nombre as metodo_pago 
             FROM pedido p 
             JOIN metodo_pago mp ON p.id_metodo_pago = mp.id_metodo_pago  
             WHERE p.id_usuario = ? 
             ORDER BY p.id_pedido DESC`, 
            [id_usuario]
        ); 
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener todos los pedidos" });
    }
});

// 2. SEGUNDO: La ruta con parámetro (esta siempre va al final de su grupo)
app.get('/api/pedidos/:id_usuario', async (req, res) => {
    const { id_usuario } = req.params;
    try {
        const [rows] = await pool.query(
            // CAMBIO AQUÍ: Agregamos 'as total'
            `SELECT p.id_pedido, p.fecha, p.Total as total, p.estado, mp.nombre as metodo_pago 
             FROM pedido p 
             JOIN metodo_pago mp ON p.id_metodo_pago = mp.id_metodo_pago  
             WHERE p.id_usuario = ? 
             ORDER BY p.id_pedido DESC`, 
            [id_usuario]
        ); 
        res.json(rows);
    } catch (error) {
        console.error("Error en la consulta de pedidos:", error);
        res.status(500).json({ error: "Error al obtener pedidos" });
    }
});

// --- RUTAS DE PEDIDOS ---

// AGREGA ESTO SI NO LO TIENES
app.post('/api/pedidos', async (req, res) => {
    const { id_usuario, id_pago, Total, detalles } = req.body;
    
    // Iniciamos una transacción para asegurar que todo salga bien o nada
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();

        const [pedido] = await connection.query(
            'INSERT INTO pedido (id_usuario, id_metodo_pago, Total, fecha, estado) VALUES (?, ?, ?, NOW(), "Pendiente")',
            [id_usuario, id_pago, Total]
        );

        const id_pedido = pedido.insertId;

        for (const item of detalles) {
            // 1. Insertar detalle
            await connection.query(
                'INSERT INTO pedido_detalles (id_pedido, id_producto, Cantidad, Precio_Unitario) VALUES (?, ?, ?, ?)',
                [id_pedido, item.id_producto, item.Cantidad, item.precio]
            );

            // 2. RESTAR STOCK (Aquí está la magia)
            await connection.query(
                'UPDATE producto SET stock = stock - ? WHERE id_producto = ?',
                [item.Cantidad, item.id_producto]
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
export default app;