// BACKEND
// Routes RDV (protégées par JWT)

import { Router } from "express";
import { requireAuth,requireOwner  } from "../middlewares/auth.middleware";
import { createAppointment,
    getAvailability,
    listAppointmentsForDay,
    listMyAppointments,
    cancelAppointment,
    rescheduleAppointment,
} from "../controllers/appointment.controller";

const router = Router();

//  toutes les routes RDV nécessitent un token
router.use(requireAuth);
//  Client : mes RDV
router.get("/my", listMyAppointments);
// Client : annuler un RDV
router.patch("/:id/cancel", cancelAppointment);
// Client : reporter un RDV
router.patch("/:id/reschedule", rescheduleAppointment);
// Disponibilités
router.get("/availability", getAvailability);
// owner voit les rdv du jour
router.get("/", requireOwner, listAppointmentsForDay);
// Créer un RDV
router.post("/", createAppointment);

export default router;
