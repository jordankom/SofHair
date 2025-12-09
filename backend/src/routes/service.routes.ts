// Routes pour les prestations

import { Router } from 'express';
import { getServices } from '../controllers/service.controller';

const router = Router();

// GET /api/services
router.get('/', getServices);

export default router;
