import { Router } from "express";
import { requireAuth, requireOwner } from "../middlewares/auth.middleware";
import { listClientsStats,getOwnerStats } from "../controllers/owner.controller";
import { ownerCreateStaff, ownerListStaff,
    ownerToggleStaff, ownerGetStaffSchedule,} from "../controllers/staff.controller";
import { ownerCreatePromotion, ownerDeletePromotion,
    ownerListPromotions, ownerTogglePromotion } from "../controllers/promotion.controller";



const router = Router();

router.use(requireAuth);
router.use(requireOwner);

// GET /api/owner/clients
router.get("/clients", listClientsStats);


router.get("/staff", ownerListStaff);
router.post("/staff", ownerCreateStaff);
router.patch("/staff/:id/toggle", ownerToggleStaff);
router.get("/staff/:id/schedule", ownerGetStaffSchedule);

router.get("/stats", getOwnerStats);
router.get("/promotions", ownerListPromotions);
router.post("/promotions", ownerCreatePromotion);
router.patch("/promotions/:id/toggle", ownerTogglePromotion);
router.delete("/promotions/:id", ownerDeletePromotion);

export default router;
