// Middleware centralisé pour gérer toutes les erreurs dans l'app

import { Request, Response, NextFunction } from 'express';
import env from '../config/env';

export function errorHandler(error: any, req: Request, res: Response, next: NextFunction) {
    console.error('💥 Erreur attrapée par errorHandler :', error);

    const statusCode = error.statusCode || 500;

    const response: { message: string; stack?: string } = {
        message: error.message || 'Erreur serveur.'
    };

    if (env.nodeEnv === 'development') {
        response.stack = error.stack;
    }

    res.status(statusCode).json(response);
}
