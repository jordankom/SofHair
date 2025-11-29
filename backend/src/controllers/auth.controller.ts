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
        const { email, password, confirmPassword, firstName, lastName } = req.body;

        // Vérifications de base
        if (!email || !password || !confirmPassword) {
            return res.status(400).json({ message: 'Email et mot de passe sont requis.' });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Les mots de passe ne correspondent pas.' });
        }

        const result = await registerUser({ email, password, firstName, lastName });

        return res.status(201).json(result);
    } catch (error: any) {
        if (error.message === 'EMAIL_ALREADY_USED') {
            return res.status(409).json({ message: 'Cet email est déjà utilisé.' });
        }

        console.error('[AUTH] Erreur register :', error);
        return res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
}
