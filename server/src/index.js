import app from './app.js';
import { connectDB } from './db.js';

const startServer = async () => {
  try {
    await connectDB(); // esperar conexión
    app.listen(3000);
    console.log('Server listening on port', 3000);
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
  }
};

startServer();