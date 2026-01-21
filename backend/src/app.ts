// src/app.ts
// Configuration de l'application Express : middlewares globaux + routes

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes';
import { errorHandler } from './middlewares/error.middleware';

const app: Application = express();

// Sécurité HTTP de base
app.use(helmet());

// Autoriser les requêtes depuis le frontend
app.use(cors({
    origin: [
        "https://softhair-41140.web.app",
        "https://softhair-41140.firebaseapp.com",
        "https://softhair.site",
        "http://localhost:5173"
    ],
    credentials: false, // true uniquement si cookies
}));

// Parsing du JSON
app.use(express.json());

// Logs HTTP
app.use(morgan('dev'));

// Route de test rapide
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Toutes les routes de l'API sous /api
app.use('/api', routes);

// Middleware global d'erreurs
app.use(errorHandler);

export default app;
