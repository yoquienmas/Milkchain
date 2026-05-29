import { pool } from "../db.js";

<<<<<<< HEAD
// RENOMBRADO: De getProducts a listarProductos para coincidir con la conversación
export const listarProductos = async (req, res) => {
    try {
=======
export const getProducts = async (req, res) => {
    try {
        // Esta consulta busca el producto Y su primera imagen asociada
>>>>>>> b5ab6f709b118a2f316c3b9784cabbfd3fb20bcc
        const [rows] = await pool.query(`
            SELECT 
                p.*, 
                c.nombre as categoria_nombre,
                (SELECT pi.ruta FROM producto_imagen pi WHERE pi.id_producto = p.id_producto LIMIT 1) as url_imagen
            FROM producto p
            LEFT JOIN categoria c ON p.id_categoria = c.id_categoria
            WHERE p.activo = 1
        `);
        
<<<<<<< HEAD
=======
        // Verificación de seguridad: si no hay imagen, le ponemos null explícitamente
>>>>>>> b5ab6f709b118a2f316c3b9784cabbfd3fb20bcc
        const productosConImagen = rows.map(prod => ({
            ...prod,
            url_imagen: prod.url_imagen || null
        }));

        res.json(productosConImagen);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};