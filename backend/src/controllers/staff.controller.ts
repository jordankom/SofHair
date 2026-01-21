import { Response } from "express";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { StaffModel } from "../models/staff.model";

// GET /api/staff (public/auth) => liste des coiffeurs actifs (pour le client)
export async function listActiveStaff(req: AuthenticatedRequest, res: Response) {
    const staff = await StaffModel.find({ isActive: true }).sort({ lastName: 1, firstName: 1 });
    return res.json(staff);
}

// GET /api/owner/staff (owner) => liste complète
export async function ownerListStaff(req: AuthenticatedRequest, res: Response) {
    const staff = await StaffModel.find().sort({ lastName: 1, firstName: 1 });
    return res.json(staff);
}

// POST /api/owner/staff (owner) => créer
export async function ownerCreateStaff(req: AuthenticatedRequest, res: Response) {
    const { firstName, lastName, email } = req.body as { firstName: string; lastName: string; email?: string };

    if (!firstName?.trim() || !lastName?.trim()) {
        return res.status(400).json({ message: "firstName et lastName sont requis." });
    }

    const created = await StaffModel.create({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email?.trim() || undefined,
        isActive: true,
    });

    return res.status(201).json(created);
}
