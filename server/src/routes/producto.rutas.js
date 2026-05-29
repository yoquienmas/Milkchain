import { Router } from "express";
<<<<<<< HEAD
// Importamos el método unificado con la conversación UML
import { listarProductos } from "../controllers/producto.controlador.js"; 

const router = Router();

// PASO 1.1: Al impactar la ruta del catálogo, se delega al método experto
router.get("/productos", listarProductos);
=======
import { pool } from "../db.js"; // Tu conexión a MySQL

const router = Router();

router.get("/productos", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM producto");
    res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});
>>>>>>> b5ab6f709b118a2f316c3b9784cabbfd3fb20bcc

export default router;