// BACKEND
// Fichier qui centralise les routes de l'API.

import { Router } from 'express';
import authRoutes from './auth.routes';

const router = Router();

// Préfixe /api/auth pour toutes les routes d'auth
router.use('/auth', authRoutes);

export default router;
