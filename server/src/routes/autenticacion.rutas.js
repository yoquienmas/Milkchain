import { Router } from "express";
import { iniciarSesion, cerrarSesion, registrarUsuario, verificarToken } from "../controllers/autenticacion.controlador.js";
import { authRequired } from "../middlewares/validateToken.js";

const router = Router();

router.post("/register", registrarUsuario);
router.post("/login", iniciarSesion);
router.post("/logout", cerrarSesion);
router.get("/verify", authRequired, verificarToken);

export default router;