import { pool } from "../db.js";
import bcrypt from "bcryptjs"; 
import jwt from "jsonwebtoken"; // Asegúrate de tener esta importación
import { createAccessToken } from "../libs/jwt.js";
import { TOKEN_SECRET } from "../config.js"; // Asegúrate de tener tu secreto

export const login = async (req, res) => {
    const { email, password } = req.body;
    console.log("Datos recibidos del cliente:", { email, password});
    try {
        const [rows] = await pool.query(
            `SELECT u.*, r.nombre as rol 
             FROM usuario u
             LEFT JOIN rol r ON u.id_rol = r.id_rol
             WHERE u.email = ?`, 
            [email]
        );
        console.log("Usuario encontrado en DB:", rows[0]);

        if (rows.length === 0) return res.status(400).json({ message: "El correo no existe" });

        const user = rows[0];
        
        const isMatch = await bcrypt.compare(password, user.password);        
        
        if (!isMatch) return res.status(400).json({ message: "Contraseña incorrecta" });

        // ASEGURAMOS EL ID: Si tu DB usa id_usuario, usa user.id_usuario
        const userId = user.id || user.id_usuario; 
        
        const token = await createAccessToken({ id: user.id_usuario, rol: user.rol });
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax'
        });

        res.json({
            id: userId,
            nombre: user.nombre,
            email: user.email,
            id_rol: user.id_rol,
            rol: user.rol || "Cliente"
        });
    } catch (error) {
        console.error("ERROR CRÍTICO EN LOGIN:", error); // <-- ESTO TE DARÁ EL ERROR REAL
        res.status(500).json({ message: error.message });
    }
};

export const register = async (req, res) => {
    const { nombre, apellido, dni, telefono, email, password } = req.body;
    try {
        const passHash = await bcrypt.hash(password, 10);
        const [rows] = await pool.query(
    "INSERT INTO usuario (nombre, apellido, dni, email, password, activo, id_rol) VALUES (?, ?, ?, ?, ?, 1, 2)",
    [nombre, apellido, dni, email, passHash]
);

        return res.status(201).json({
            message: "Usuario registrado exitosamente",
            id: rows.insertId,
            nombre,
            email
        });
   } catch (error) {
       res.status(500).json({ message: "Error al registrar usuario" });
   }
};

export const verifyToken = async (req, res) => {
    const { token } = req.cookies;
    if (!token) return res.status(401).json({ message: "No autorizado" });

    jwt.verify(token, TOKEN_SECRET, async (err, decoded) => {
        if (err) return res.status(401).json({ message: "No autorizado" });

        try {
            const [rows] = await pool.query(
                `SELECT u.id_usuario AS id, u.nombre, u.email, r.nombre as rol, u.id_rol 
                 FROM usuario u
                 LEFT JOIN rol r ON u.id_rol = r.id_rol
                 WHERE u.id_usuario = ?`, 
                [decoded.id]
            );

            if (rows.length === 0) return res.status(401).json({ message: "No autorizado" });

            res.json({
                id: rows[0].id,
                nombre: rows[0].nombre,
                email: rows[0].email,
                id_rol: rows[0].id_rol,
                rol: rows[0].rol || "Cliente"
            });
        } catch (dbErr) {
            console.error("Error en verifyToken DB query:", dbErr);
            return res.status(500).json({ message: "Error de servidor al verificar token" });
        }
    });
}; 
export const logout = (req, res) => {
    res.cookie("token", "", {
        expires: new Date(0),
    });
    return res.sendStatus(200);
};