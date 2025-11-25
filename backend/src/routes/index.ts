// Point d'entrée regroupant toutes les routes de l'API
// /api/Auth, /api/users, /api/appointments, etc.

import { Router } from 'express';
import authRoutes from './auth.routes';

const router = Router();

router.use('/Auth', authRoutes);

// TODO : plus tard :
// router.use('/coiffures', coiffureRoutes);
// router.use('/rendezvous', rendezVousRoutes);

export default router;
