// BACKEND
// Fichier qui centralise les routes de l'API.

import { Router } from 'express';
import authRoutes from './auth.routes';
import serviceRoutes from './service.routes';

const router = Router();

// Préfixe /api/auth pour toutes les routes d'auth
router.use('/auth', authRoutes);
router.use('/services', serviceRoutes);
export default router;
