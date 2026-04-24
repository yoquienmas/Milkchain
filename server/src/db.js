import mysql from "mysql2/promise";

export const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "", // en XAMPP suele estar vacío
    database: "MilkChain",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

export const connectDB = async () => {
    try {
        const connection = await pool.getConnection();
        console.log(">>> Conectado a MySQL");
        connection.release();
    } catch (error) {
        console.error("Error en la base de datos:", error.message);
    }
};