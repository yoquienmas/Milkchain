import { pool } from "../db.js";
import bcrypt from "bcryptjs"; 
import { createAccessToken } from "../libs/jwt.js";

// --- LOGIN ACTUALIZADO ---
export const login = async (req, res) => {
    const { email, pass } = req.body;

    try {
        // Hacemos un JOIN para traer el nombre del rol directamente
        const [rows] = await pool.query(
            `SELECT u.*, r.nombre as rol 
             FROM usuario u
             LEFT JOIN rol_usuario ru ON u.id = ru.id_Usuario
             LEFT JOIN rol r ON ru.id_Rol = r.id
             WHERE u.email = ?`, 
            [email]
        );
        
        if (rows.length === 0) return res.status(400).json(["El correo no existe"]);

        const user = rows[0];
        const isMatch = await bcrypt.compare(pass, user.pass);
        if (!isMatch) return res.status(400).json(["Contraseña incorrecta"]);

        const token = await createAccessToken({ id: user.id, rol: user.rol }); // Agregamos rol al token

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax'
        });

        res.json({
            id: user.id,
            nombre: user.nombre,
            email: user.email,
            rol: user.rol || "Cliente" // Si no tiene rol, por defecto es Cliente
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- REGISTER ACTUALIZADO ---
export const register = async (req, res) => {
    const { nombre, apellido, dni, telefono, email, pass } = req.body;

    try {
        const passHash = await bcrypt.hash(pass, 10);
        const [rows] = await pool.query(
            "INSERT INTO usuario (nombre, apellido, dni, telefono, email, pass) VALUES (?, ?, ?, ?, ?, ?)",
            [nombre, apellido, dni, telefono, email, passHash]
        );

        const userId = rows.insertId;

        // ASIGNACIÓN AUTOMÁTICA DE ROL: Por defecto ID 2 (Cliente)
        await pool.query(
            "INSERT INTO rol_usuario (id_Usuario, id_Rol, activo) VALUES (?, ?, ?)",
            [userId, 2, 1] 
        );

        const token = await createAccessToken({ id: userId, rol: "Cliente" });
        res.cookie("token", token);

        res.json({ id: userId, nombre, email, rol: "Cliente" });

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return res.status(400).json(["El correo ya está en uso"]);
        res.status(500).json({ message: error.message });
    }
};

// --- LOGOUT ---
export const logout = (req, res) => {
    // Limpiamos la cookie del token poniéndole una fecha de expiración antigua
    res.cookie("token", "", {
        expires: new Date(0),
    });
    return res.sendStatus(200);
};

// --- VERIFY TOKEN ---
// Esta sirve para que cuando el usuario recargue la página, 
// el Frontend sepa que sigue logueado.
export const verifyToken = async (req, res) => {
    const { token } = req.cookies;

    if (!token) return res.status(401).json({ message: "No autorizado" });

    jwt.verify(token, TOKEN_SECRET, async (err, user) => {
        if (err) return res.status(401).json({ message: "No autorizado" });

        const [rows] = await pool.query("SELECT * FROM usuario WHERE id = ?", [user.id]);
        if (rows.length === 0) return res.status(401).json({ message: "No autorizado" });

        const userFound = rows[0];

        return res.json({
            id: userFound.id,
            nombre: userFound.nombre,
            email: userFound.email,
        });
    });
};