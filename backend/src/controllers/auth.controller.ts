// BACKEND
// Contrôleur d'authentification.
// Reçoit email + password, utilise le service, renvoie token + infos user.

import { Request, Response } from 'express';
import { loginUser , registerUser} from '../services/auth.service';

export async function login(req: Request, res: Response) {
    try {
        const { email, password } = req.body;

        // Vérification minimaliste des champs
        if (!email || !password) {
            return res.status(400).json({ message: 'Email et mot de passe requis.' });
        }

        const result = await loginUser(email, password);

        return res.status(200).json(result);
    } catch (error: any) {
        if (error.message === 'EMAIL_OR_PASSWORD_INVALID') {
            return res.status(401).json({ message: 'Email ou mot de passe invalide.' });
        }

        console.error('[AUTH] Erreur login :', error);
        return res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
}

// Contrôleur d'inscription

export async function register(req: Request, res: Response) {
    try {
        // On récupère AUSSI le rôle depuis le body
        const { email, password, firstName, lastName, role } = req.body;

        //  Et on le transmet au service
        const result = await registerUser({
            email,
            password,
            firstName,
            lastName,
            role,
        });

        res.status(201).json(result);
    } catch (error: any) {
        console.error('[AUTH] Erreur register :', error);
        res.status(400).json({ message: error.message || 'Erreur lors de la création du compte' });
    }
}

