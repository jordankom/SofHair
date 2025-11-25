// Middleware pour vérifier le JWT et, optionnellement, le rôle de l'utilisateur (owner/client)

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import env from '../config/env';
import { UserRole } from '../models/user.model';

interface JwtPayload {
    id: string;
    role: UserRole;
}

// On étend l'interface Request d'Express pour y ajouter "user"
export interface AuthenticatedRequest extends Request {
    user?: JwtPayload;
}

// Vérifie que l'utilisateur est authentifié (JWT valide)
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Token manquant ou invalide.' });
        }

        const token = authHeader.split(' ')[1];

        const payload = jwt.verify(token, env.jwtSecret) as JwtPayload;

        req.user = payload;

        next();
    } catch (error) {
        console.error('Erreur middleware Auth :', (error as Error).message);
        return res.status(401).json({ message: 'Token invalide ou expiré.' });
    }
}

// Vérifie que l'utilisateur est propriétaire (owner)
export function requireOwner(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    if (!req.user || req.user.role !== 'owner') {
        return res.status(403).json({ message: 'Accès réservé au propriétaire.' });
    }
    next();
}
