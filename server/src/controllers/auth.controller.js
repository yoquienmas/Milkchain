import { pool } from "../db.js";
import bcrypt from "bcryptjs"; 
import jwt from "jsonwebtoken"; // Asegúrate de tener esta importación
import { createAccessToken } from "../libs/jwt.js";
import { TOKEN_SECRET } from "../config.js"; // Asegúrate de tener tu secreto

export const login = async (req, res) => {
    const { email, pass } = req.body;
    try {
        const [rows] = await pool.query(
            `SELECT u.*, r.nombre as rol 
             FROM usuario u
             LEFT JOIN rol r ON u.id_rol = r.id_rol
             WHERE u.email = ?`, 
            [email]
        );
        
        if (rows.length === 0) return res.status(400).json(["El correo no existe"]);

        const user = rows[0];
        const isMatch = await bcrypt.compare(pass, user.pass);        
        
        if (!isMatch) return res.status(400).json(["Contraseña incorrecta"]);

        const token = await createAccessToken({ id: user.id, rol: user.rol });

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax'
        });

        res.json({
            id: user.id,
            nombre: user.nombre,
            email: user.email,
            rol: user.rol || "Cliente"
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const register = async (req, res) => {
    const { nombre, apellido, dni, telefono, email, pass } = req.body;
    try {
        const passHash = await bcrypt.hash(pass, 10);
        const [rows] = await pool.query(
            "INSERT INTO usuario (nombre, apellido, dni, telefono, email, pass, activo, f_creacion, id_rol) VALUES (?, ?, ?, ?, ?, ?, 1, NOW(), 2)",
            [nombre, apellido, dni, telefono, email, passHash]
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

        const [rows] = await pool.query(
            `SELECT u.id, u.nombre, u.email, r.nombre as rol 
             FROM usuario u
             LEFT JOIN rol r ON u.id_rol = r.id_rol
             WHERE u.id = ?`, 
            [decoded.id]
        );

        if (rows.length === 0) return res.status(401).json({ message: "No autorizado" });

        res.json({
            id: rows[0].id,
            nombre: rows[0].nombre,
            email: rows[0].email,
            rol: rows[0].rol || "Cliente"
        });
    });
}; // <--- AQUÍ SE CIERRA verifyToken

export const logout = (req, res) => {
    res.cookie("token", "", {
        expires: new Date(0),
    });
    return res.sendStatus(200);
};