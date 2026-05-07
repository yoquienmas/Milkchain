import app from "./app.js";
import { connectDB } from "./db.js";

connectDB(); // Esto ejecutará tu función con el console.log(">>> Conectado a MySQL")
app.listen(3000);
console.log("Servidor en puerto", 3000);