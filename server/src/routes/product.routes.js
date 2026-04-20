import { Router } from "express";
import { pool } from "../db.js"; // Tu conexión a MySQL

const router = Router();

router.get("/productos", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM Producto");
    res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

export default router;