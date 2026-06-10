import { Router } from "express";
// Importamos el método unificado con la conversación UML
import { listarProductos } from "../controllers/producto.controlador.js"; 

const router = Router();

// PASO 1.1: Al impactar la ruta del catálogo, se delega al método experto
router.get("/productos", listarProductos);

export default router;