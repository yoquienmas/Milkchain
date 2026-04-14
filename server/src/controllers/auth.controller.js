import { pool } from "../db.js";
import bcrypt from "bcryptjs"; // Para comparar contraseñas encriptadas
import { createAccessToken } from "../libs/jwt.js"; // Tu función para crear tokens

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Buscamos al usuario por correo en la tabla correspondiente
        const [rows] = await pool.query("SELECT * FROM Usuario WHERE email = ?", [email]);
        
        if (rows.length === 0) return res.status(400).json(["El correo no existe"]);

        const user = rows[0];

        // Comparamos la contraseña (asumiendo que están encriptadas)
        // const isMatch = await bcrypt.compare(password, user.password);
        // Si aún no usas bcrypt, usa: if (password !== user.password)
        if (password !== user.pass) return res.status(400).json(["Contraseña incorrecta"]);

        const token = await createAccessToken({ id: user.id });

        res.cookie("token", token);
        res.json({
            id: user.id,
            username: user.username,
            email: user.email,
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const register = async (req, res) => {
  const { email, pass, dni, nombre, apellido, telefono } = req.body;

  try {
    // 1. Verificar si el usuario ya existe
    const [userExists] = await pool.query("SELECT * FROM Usuario WHERE email = ?", [email]);
    if (userExists.length > 0) return res.status(400).json(["El email ya está en uso"]);

    // 2. Insertar nuevo usuario (activo por defecto = 1)
    // f_Creacion usa NOW() para la fecha actual de MySQL
    const [result] = await pool.query(
      "INSERT INTO Usuario (email, pass, dni, nombre, apellido, activo, telefono, f_Creacion) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())",
      [email, pass, dni, nombre, apellido, 1, telefono]
    );

    res.json({
      id: result.insertId,
      nombre,
      email,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};