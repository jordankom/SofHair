// Le contrôleur gère uniquement la partie HTTP (req/res)
// et délègue la logique métier au service d'Auth.

import { Request, Response, NextFunction } from 'express';
import { loginUser, registerUser } from '../services/auth.service';
import { UserRole } from '../models/user.model';

// Typage du corps de requête pour la lisibilité
interface AuthRequestBody {
    email: string;
    password: string;
    role?: UserRole;
}

export async function register(req: Request<unknown, unknown, AuthRequestBody>, res: Response, next: NextFunction) {
    try {
        const { email, password, role } = req.body;

        if (!email || !password) {
            const error = new Error('Email et mot de passe sont obligatoires.');
            (error as any).statusCode = 400;
            throw error;
        }

        const result = await registerUser(email, password, role);

        res.status(201).json({
            message: 'Utilisateur créé avec succès.',
            ...result
        });
    } catch (error) {
        next(error);
    }
}

export async function login(req: Request<unknown, unknown, AuthRequestBody>, res: Response, next: NextFunction) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            const error = new Error('Email et mot de passe sont obligatoires.');
            (error as any).statusCode = 400;
            throw error;
        }

        const result = await loginUser(email, password);

        res.json({
            message: 'Connexion réussie.',
            ...result
        });
    } catch (error) {
        next(error);
    }
}
