import { pool } from "../db.js";

export const getProducts = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT p.*, c.nombre as categoria_nombre 
            FROM Producto p
            LEFT JOIN Categoria c ON p.id_Categoria = c.id
            WHERE p.activo = 1
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};