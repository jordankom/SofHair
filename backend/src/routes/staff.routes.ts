import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { listActiveStaff } from "../controllers/staff.controller";

const router = Router();

// tu es déjà dans un espace client protégé, donc auth OK
router.use(requireAuth);

// GET /api/staff
router.get("/", listActiveStaff);

export default router;
