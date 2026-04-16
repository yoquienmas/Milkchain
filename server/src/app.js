import express from 'express'
import morgan from "morgan";
import 'dotenv/config';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import productRoutes from './routes/product.routes.js';
import authRoutes from './routes/auth.routes.js'; 
const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

app.use('/api', authRoutes);
app.use('/api', productRoutes); 

// QUITAMOS el app.listen de acá para que no choque con index.js
export default app;