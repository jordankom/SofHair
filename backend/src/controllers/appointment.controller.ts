// BACKEND
// Disponibilités + création RDV

import { Response } from "express";
import dayjs from "dayjs";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { AppointmentModel } from "../models/appointment.model";
import { ServiceModel } from "../models/service.model";

// ⚙ Génère les créneaux 09:00 → 18:00 toutes les 30 minutes
function buildSlotsForDay(dateISO: string) {
    const day = dayjs(dateISO).startOf("day");
    const slots: string[] = [];

    for (let h = 9; h <= 17; h++) {
        slots.push(day.hour(h).minute(0).second(0).millisecond(0).toISOString());
        slots.push(day.hour(h).minute(30).second(0).second(0).millisecond(0).toISOString());
    }
    slots.push(day.hour(18).minute(0).second(0).millisecond(0).toISOString());

    return slots;
}

// GET /api/appointments/availability?date=YYYY-MM-DD
export async function getAvailability(req: AuthenticatedRequest, res: Response) {
    const date = String(req.query.date || "");

    if (!date) {
        return res.status(400).json({ message: "Paramètre 'date' requis (YYYY-MM-DD)." });
    }

    //  Slots possibles
    const slots = buildSlotsForDay(date);

    //  On récupère les RDV déjà bookés sur la journée
    const start = dayjs(date).startOf("day").toDate();
    const end = dayjs(date).endOf("day").toDate();

    const booked = await AppointmentModel.find({
        status: "booked",
        startAt: { $gte: start, $lte: end },
    }).select("startAt");

    const bookedSet = new Set(booked.map((a) => a.startAt.toISOString()));

    //  On renvoie une liste avec dispo true/false
    const response = slots.map((iso) => ({
        dateTimeISO: iso,
        available: !bookedSet.has(iso),
    }));

    return res.json(response);
}

// POST /api/appointments
export async function createAppointment(req: AuthenticatedRequest, res: Response) {
    if (!req.user) return res.status(401).json({ message: "Non authentifié." });

    const { serviceId, dateTimeISO } = req.body as { serviceId: string; dateTimeISO: string };

    if (!serviceId || !dateTimeISO) {
        return res.status(400).json({ message: "serviceId et dateTimeISO sont requis." });
    }

    //  On charge la prestation pour connaitre la durée
    const service = await ServiceModel.findById(serviceId);
    if (!service || !service.isActive) {
        return res.status(404).json({ message: "Prestation introuvable ou inactive." });
    }

    const startAt = new Date(dateTimeISO);
    const endAt = dayjs(startAt).add(service.durationMinutes, "minute").toDate();

    //  Vérifie si le créneau est déjà pris
    const exists = await AppointmentModel.findOne({
        status: "booked",
        startAt,
    });

    if (exists) {
        return res.status(409).json({ message: "Créneau déjà réservé." });
    }

    const appt = await AppointmentModel.create({
        userId: req.user.id,
        serviceId,
        startAt,
        endAt,
        status: "booked",
    });

    return res.status(201).json(appt);
}

// GET /api/appointments?date=YYYY-MM-DD
export async function listAppointmentsForDay(req: AuthenticatedRequest, res: Response) {
    //  sécurité
    if (!req.user) return res.status(401).json({ message: "Non authentifié." });

    const date = String(req.query.date || "");
    if (!date) {
        return res.status(400).json({ message: "Paramètre 'date' requis (YYYY-MM-DD)." });
    }

    //  bornes de la journée
    const start = dayjs(date).startOf("day").toDate();
    const end = dayjs(date).endOf("day").toDate();

    //  fetch + populate client + service
    const appointments = await AppointmentModel.find({
        status: "booked",
        startAt: { $gte: start, $lte: end },
    })
        .sort({ startAt: 1 }) // tri chronologique
        .populate("userId", "firstName lastName email") // client
        .populate("serviceId", "name category price durationMinutes"); // service

    return res.json(appointments);
}