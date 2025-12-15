// Routes pour les prestations

import { Router } from 'express';
import { listServiceCategories, getServices, createService  } from "../controllers/service.controller";
import appointmentRoutes from "./appointment.routes";

const router = Router();

// GET /api/services
router.get('/', getServices);
router.get("/categories", listServiceCategories);
router.post("/", createService);
router.use("/appointments", appointmentRoutes);

export default router;
