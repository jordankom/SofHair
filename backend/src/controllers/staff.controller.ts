// BACKEND - controllers/staff.controller.ts
// Owner : lister/ajouter/toggle + consulter planning d'un coiffeur
// Public : lister les coiffeurs actifs (pour BookingModal côté client)

import { Response } from "express";
import dayjs from "dayjs";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { StaffModel } from "../models/staff.model";
import { AppointmentModel } from "../models/appointment.model";

// ==============================
// PUBLIC (CLIENT) : coiffeurs actifs
// GET /api/staff
// ==============================
export async function listActiveStaff(req: AuthenticatedRequest, res: Response) {
    try {
        const staff = await StaffModel.find({ isActive: true }).sort({ lastName: 1, firstName: 1 });
        return res.json(staff);
    } catch (e) {
        console.error("listActiveStaff error:", (e as Error).message);
        return res.status(500).json({ message: "Erreur serveur (staff)." });
    }
}

// ==============================
// OWNER : liste complète
// GET /api/owner/staff
// ==============================
export async function ownerListStaff(req: AuthenticatedRequest, res: Response) {
    try {
        const staff = await StaffModel.find().sort({ lastName: 1, firstName: 1 });
        return res.json(staff);
    } catch (e) {
        console.error("ownerListStaff error:", (e as Error).message);
        return res.status(500).json({ message: "Erreur serveur (staff owner)." });
    }
}

// ==============================
// OWNER : créer coiffeur (fiche interne)
// POST /api/owner/staff
// ==============================
export async function ownerCreateStaff(req: AuthenticatedRequest, res: Response) {
    try {
        const { firstName, lastName, email } = req.body;

        if (!firstName?.trim() || !lastName?.trim()) {
            return res.status(400).json({ message: "firstName et lastName sont requis." });
        }

        const created = await StaffModel.create({
            firstName: String(firstName).trim(),
            lastName: String(lastName).trim(),
            email: email ? String(email).trim().toLowerCase() : undefined,
            isActive: true,
        });

        return res.status(201).json(created);
    } catch (e) {
        console.error("ownerCreateStaff error:", (e as Error).message);
        return res.status(500).json({ message: "Erreur serveur (création staff)." });
    }
}

// ==============================
// OWNER : activer/désactiver un coiffeur
// PATCH /api/owner/staff/:id/toggle
// body: { isActive: boolean }
// ==============================
export async function ownerToggleStaff(req: AuthenticatedRequest, res: Response) {
    try {
        const id = String(req.params.id || "");
        const { isActive } = req.body as { isActive: boolean };

        if (typeof isActive !== "boolean") {
            return res.status(400).json({ message: "isActive doit être un booléen." });
        }

        const updated = await StaffModel.findByIdAndUpdate(id, { isActive }, { new: true });
        if (!updated) return res.status(404).json({ message: "Coiffeur introuvable." });

        return res.json(updated);
    } catch (e) {
        console.error("ownerToggleStaff error:", (e as Error).message);
        return res.status(500).json({ message: "Erreur serveur (toggle staff)." });
    }
}

// ==============================
// OWNER : planning d'un coiffeur
// GET /api/owner/staff/:id/schedule?from=YYYY-MM-DD&to=YYYY-MM-DD
// -> booked uniquement (pas cancelled)
// ==============================
export async function ownerGetStaffSchedule(req: AuthenticatedRequest, res: Response) {
    try {
        const staffId = String(req.params.id || "");
        const from = String(req.query.from || "");
        const to = String(req.query.to || "");

        if (!from || !to) {
            return res.status(400).json({ message: "from et to sont requis (YYYY-MM-DD)." });
        }

        const start = dayjs(from).startOf("day").toDate();
        const end = dayjs(to).endOf("day").toDate();

        const appts = await AppointmentModel.find({
            staffId,
            status: "booked",
            startAt: { $gte: start, $lte: end },
        })
            .populate("userId", "firstName lastName email")
            .populate("serviceId", "name category price durationMinutes")
            .sort({ startAt: 1 });

        return res.json(appts);
    } catch (e) {
        console.error("ownerGetStaffSchedule error:", (e as Error).message);
        return res.status(500).json({ message: "Erreur serveur (planning staff)." });
    }
}
