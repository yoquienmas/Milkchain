// app.js - CONFIGURACIÓN FINAL
import express from 'express'
import morgan from "morgan";
import 'dotenv/config';
import cors from 'cors';
import cookieParser from 'cookie-parser';



const app = express();

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

export default app;

