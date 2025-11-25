// Point d'entrée du backend : connexion à la DB puis lancement du serveur HTTP

import http from 'http';
import app from './app';
import { connectDB } from './config/db';
import env from './config/env';
import { logError, logInfo } from './utils/logger';

async function startServer(): Promise<void> {
    try {
        await connectDB();

        const server = http.createServer(app);

        server.listen(env.port, () => {
            logInfo(`🚀 Backend démarré sur http://localhost:${env.port}`);
        });
    } catch (error) {
        logError('❌ Erreur au démarrage du serveur :', (error as Error).message);
        process.exit(1);
    }
}

startServer();
