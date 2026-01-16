// BACKEND
// Logique métier : calcul créneaux + création RDV

import { AppointmentModel } from "../models/appointment.model";
import { Types } from "mongoose";

// Génère des créneaux simples (ex: 09:00 -> 18:00 toutes les 30 min)
export function generateSlots(dateISO: string) {
    const slots: string[] = [];

    const day = new Date(`${dateISO}T00:00:00.000Z`);
    // Horaires salon (à rendre configurable plus tard)
    const startHour = 9;
    const endHour = 18;
    const stepMinutes = 30;

    for (let h = startHour; h < endHour; h++) {
        for (let m = 0; m < 60; m += stepMinutes) {
            const d = new Date(day);
            d.setUTCHours(h, m, 0, 0);
            slots.push(d.toISOString());
        }
    }

    return slots;
}

export async function getAvailability(dateISO: string) {
    // 1) Crée tous les créneaux possibles
    const allSlots = generateSlots(dateISO);

    // 2) Cherche les RDV existants de la journée (booked uniquement)
    const start = new Date(`${dateISO}T00:00:00.000Z`);
    const end = new Date(`${dateISO}T23:59:59.999Z`);

    const existing = await AppointmentModel.find({
        startAt: { $gte: start, $lte: end },
        status: "booked",
    }).select("startAt");

    const busy = new Set(existing.map((a) => a.startAt.toISOString()));

    // 3) Ne renvoie que les créneaux libres
    return allSlots.filter((s) => !busy.has(s));
}

export async function createAppointment(params: {
    clientId: string;
    serviceId: string;
    startAtISO: string;
    durationMinutes: number;
}) {
    const startAt = new Date(params.startAtISO);
    const endAt = new Date(startAt.getTime() + params.durationMinutes * 60_000);

    //  Vérifie conflit (slot occupé)
    const conflict = await AppointmentModel.findOne({
        startAt,
        status: "booked",
    });

    if (conflict) {
        throw new Error("SLOT_NOT_AVAILABLE");
    }

    const created = await AppointmentModel.create({
        userId: new Types.ObjectId(params.clientId),
        serviceId: new Types.ObjectId(params.serviceId),
        startAt,
        endAt,
        status: "booked",
    });

    return created;
}

export async function getMyAppointments(clientId: string) {
    return AppointmentModel.find({ clientId }).sort({ startAt: 1 });
}
