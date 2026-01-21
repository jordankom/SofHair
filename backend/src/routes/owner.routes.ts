import { Router } from "express";
import { requireAuth, requireOwner } from "../middlewares/auth.middleware";
import { listClientsStats,getOwnerStats } from "../controllers/owner.controller";
import { ownerCreateStaff, ownerListStaff } from "../controllers/staff.controller";


const router = Router();

router.use(requireAuth);
router.use(requireOwner);

// GET /api/owner/clients
router.get("/clients", listClientsStats);


router.get("/staff", ownerListStaff);
router.post("/staff", ownerCreateStaff);
router.get("/stats", getOwnerStats);

export default router;
