import { pool } from "../db.js";
import bcrypt from "bcryptjs"; 
import { createAccessToken } from "../libs/jwt.js";

// --- LOGIN ---
export const login = async (req, res) => {
    const { email, pass } = req.body; // Cambié 'pass' a 'pass' para que coincida con tu registro

    try {
        // Buscamos en la tabla 'usuario' (en minúsculas como en tu INSERT)
        const [rows] = await pool.query("SELECT * FROM usuario WHERE email = ?", [email]);
        
        if (rows.length === 0) return res.status(400).json(["El correo no existe"]);

        const user = rows[0];

        // Comparación de contraseña (usando bcrypt porque en el register las encriptamos)
        const isMatch = await bcrypt.compare(pass, user.pass);
        if (!isMatch) return res.status(400).json(["Contraseña incorrecta"]);

        const token = await createAccessToken({ id: user.id });

        res.cookie("token", token, {
            httpOnly: true,
            secure: false, // Ponelo en true si usas HTTPS
            sameSite: 'lax'
        });

        res.json({
            id: user.id,
            nombre: user.nombre,
            email: user.email,
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// --- REGISTER ---
export const register = async (req, res) => {
    const { nombre, apellido, dni, telefono, email, pass } = req.body;

    try {
        // 1. Encriptar la contraseña
        const passHash = await bcrypt.hash(pass, 10);

        // 2. Insertar en la tabla 'usuario'
        // IMPORTANTE: Asegurate que la columna en MySQL se llame 'pass'
        const [rows] = await pool.query(
            "INSERT INTO usuario (nombre, apellido, dni, telefono, email, pass) VALUES (?, ?, ?, ?, ?, ?)",
            [nombre, apellido, dni, telefono, email, passHash]
        );

        // 3. Crear token para que quede logueado de una vez
        const token = await createAccessToken({ id: rows.insertId });
        res.cookie("token", token);

        res.json({ 
            id: rows.insertId, 
            nombre, 
            email 
        });

    } catch (error) {
        // Si el email ya existe, MySQL tirará un error
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json(["El correo ya está en uso"]);
        }
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