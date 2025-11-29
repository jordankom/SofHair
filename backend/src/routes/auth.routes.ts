// BACKEND
// Route d'authentification : /api/auth/login

import { Router } from 'express';
import { login, register } from '../controllers/auth.controller';

const router = Router();

// POST /api/auth/login
router.post('/login', login);
router.post('/register', register);

export default router;
