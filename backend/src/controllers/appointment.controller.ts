// BACKEND
// Disponibilités + création RDV

import { Response } from "express";
import dayjs from "dayjs";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { AppointmentModel } from "../models/appointment.model";
import { ServiceModel } from "../models/service.model";
import { StaffModel } from "../models/staff.model";

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


function buildSlotsFromStaffSchedule(dateYYYYMMDD: string, staffDay: { start: string; end: string; isOff: boolean }, slotMinutes: number) {
    const day = dayjs(dateYYYYMMDD).startOf("day");

    // Si OFF => aucun créneau
    if (staffDay.isOff) return [];

    // Convertit "HH:mm" en dayjs
    const [sh, sm] = staffDay.start.split(":").map(Number);
    const [eh, em] = staffDay.end.split(":").map(Number);

    let cursor = day.hour(sh).minute(sm).second(0).millisecond(0);
    const end = day.hour(eh).minute(em).second(0).millisecond(0);

    const slots: string[] = [];

    // On boucle par pas de slotMinutes
    while (cursor.isBefore(end) || cursor.isSame(end)) {
        slots.push(cursor.toISOString());
        cursor = cursor.add(slotMinutes, "minute");
    }

    return slots;
}

// // GET /api/appointments/availability?date=YYYY-MM-DD
// export async function getAvailability(req: AuthenticatedRequest, res: Response) {
//     const date = String(req.query.date || "");
//
//     if (!date) {
//         return res.status(400).json({ message: "Paramètre 'date' requis (YYYY-MM-DD)." });
//     }
//
//     //  Slots possibles
//     const slots = buildSlotsForDay(date);
//
//     //  On récupère les RDV déjà bookés sur la journée
//     const start = dayjs(date).startOf("day").toDate();
//     const end = dayjs(date).endOf("day").toDate();
//
//     const booked = await AppointmentModel.find({
//         status: "booked",
//         startAt: { $gte: start, $lte: end },
//     }).select("startAt");
//
//     const bookedSet = new Set(booked.map((a) => a.startAt.toISOString()));
//
//     //  On renvoie une liste avec dispo true/false
//     const response = slots.map((iso) => ({
//         dateTimeISO: iso,
//         available: !bookedSet.has(iso),
//     }));
//
//     return res.json(response);
// }
//
// POST /api/appointments
// POST /api/appointments
// Créer un RDV pour un client + une prestation + un coiffeur


export async function createAppointment(req: AuthenticatedRequest, res: Response) {
    if (!req.user) return res.status(401).json({ message: "Non authentifié." });

    const { serviceId, dateTimeISO, staffId } = req.body as {
        serviceId: string;
        dateTimeISO: string;
        staffId: string;
    };

    if (!serviceId || !dateTimeISO || !staffId) {
        return res.status(400).json({ message: "serviceId, dateTimeISO et staffId sont requis." });
    }

    const service = await ServiceModel.findById(serviceId);
    if (!service || !service.isActive) {
        return res.status(404).json({ message: "Prestation introuvable ou inactive." });
    }

    const startAt = new Date(dateTimeISO);
    if (Number.isNaN(startAt.getTime())) {
        return res.status(400).json({ message: "dateTimeISO invalide." });
    }

    const endAt = dayjs(startAt).add(service.durationMinutes, "minute").toDate();

    //  conflit = même coiffeur + même startAt + booked
    const exists = await AppointmentModel.findOne({
        status: "booked",
        staffId,
        startAt,
    });

    if (exists) {
        return res.status(409).json({ message: "Créneau déjà réservé pour ce coiffeur." });
    }

    const appt = await AppointmentModel.create({
        userId: req.user.id,
        serviceId,
        staffId,
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
        .populate("serviceId", "name category price durationMinutes "); // service

    return res.json(appointments);
}


export async function getAvailability(req: AuthenticatedRequest, res: Response) {
    const date = String(req.query.date || "");
    const staffId = String(req.query.staffId || "");

    if (!date) return res.status(400).json({ message: "Paramètre 'date' requis (YYYY-MM-DD)." });
    if (!staffId) return res.status(400).json({ message: "Paramètre 'staffId' requis." });

    const slots = buildSlotsForDay(date);

    const start = dayjs(date).startOf("day").toDate();
    const end = dayjs(date).endOf("day").toDate();

    const booked = await AppointmentModel.find({
        status: "booked",
        staffId,
        startAt: { $gte: start, $lte: end },
    }).select("startAt");

    const bookedSet = new Set(booked.map((a) => a.startAt.toISOString()));

    const response = slots.map((iso) => ({
        dateTimeISO: iso,
        available: !bookedSet.has(iso),
    }));

    return res.json(response);
}


/**
 * GET /api/appointments/my
 * Renvoie tous les RDV (booked + cancelled si tu veux) du client connecté.
 * - Tri par date croissante
 * - Populate de la prestation (serviceId) pour afficher nom/catégorie/prix dans le front
 */
export async function listMyAppointments(req: AuthenticatedRequest, res: Response) {
    // Sécurité : requireAuth doit avoir injecté req.user
    if (!req.user) {
        return res.status(401).json({ message: "Non authentifié." });
    }

    // On récupère les RDV du client connecté
    // Ici je mets booked + cancelled pour que l'utilisateur voie aussi les annulations.
    const appointments = await AppointmentModel.find({
        userId: req.user.id,
        status: { $in: ["booked", "cancelled"] },
    })
        .sort({ startAt: 1 })
        .populate("serviceId", "name category price durationMinutes imageUrl description");

    return res.json(appointments);
}

/**
 * PATCH /api/appointments/:id/cancel
 * Annule un RDV :
 * - accessible au client propriétaire du RDV (req.user.id)
 * - passe status => "cancelled"
 * - refuse si déjà annulé
 */
export async function cancelAppointment(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
        return res.status(401).json({ message: "Non authentifié." });
    }

    const appointmentId = String(req.params.id || "").trim();
    if (!appointmentId) {
        return res.status(400).json({ message: "ID de rendez-vous manquant." });
    }

    // 1) On récupère le RDV
    const appt = await AppointmentModel.findById(appointmentId);
    if (!appt) {
        return res.status(404).json({ message: "Rendez-vous introuvable." });
    }

    // 2) Le client ne peut annuler que ses propres RDV
    if (String(appt.userId) !== req.user.id) {
        return res.status(403).json({ message: "Vous ne pouvez pas annuler ce rendez-vous." });
    }

    // 3) Si déjà annulé, on refuse
    if (appt.status === "cancelled") {
        return res.status(409).json({ message: "Ce rendez-vous est déjà annulé." });
    }

    // 4) Règle métier : pas d'annulation à moins de 3 heures
    const now = dayjs();
    const start = dayjs(appt.startAt);

    const diffHours = start.diff(now, "hour", true); // true => décimal (ex: 2.4h)

    if (diffHours < 3) {
        return res.status(409).json({
            message: "Annulation impossible à moins de 3 heures du rendez-vous.",
            code: "CANCEL_TOO_LATE",
            hoursLeft: diffHours, // utile si tu veux afficher "il reste 2h10"
        });
    }

    // 5) OK -> annulation
    appt.status = "cancelled";
    await appt.save();

    return res.json({ message: "Rendez-vous annulé.", appointment: appt });
}


// PATCH /api/appointments/:id/reschedule
// Déplace un RDV vers un autre créneau (même prestation, même client)

export async function rescheduleAppointment(req: AuthenticatedRequest, res: Response) {
    try {
        if (!req.user) return res.status(401).json({ message: "Non authentifié." });

        const appointmentId = String(req.params.id || "");
        const { dateTimeISO, staffId } = req.body as { dateTimeISO: string; staffId?: string };

        if (!appointmentId) return res.status(400).json({ message: "Paramètre :id requis." });
        if (!dateTimeISO) return res.status(400).json({ message: "dateTimeISO est requis." });

        const appt = await AppointmentModel.findById(appointmentId);
        if (!appt) return res.status(404).json({ message: "Rendez-vous introuvable." });

        if (String(appt.userId) !== req.user.id) {
            return res.status(403).json({ message: "Accès interdit." });
        }

        if (appt.status === "cancelled") {
            return res.status(400).json({ message: "Ce rendez-vous est déjà annulé." });
        }

        // ✅ règle 3h
        const diffHours = dayjs(appt.startAt).diff(dayjs(), "hour", true);
        if (diffHours < 3) {
            return res.status(403).json({ message: "Impossible de reporter à moins de 3 heures du rendez-vous." });
        }

        const service = await ServiceModel.findById(appt.serviceId);
        if (!service || !service.isActive) {
            return res.status(404).json({ message: "Prestation introuvable ou inactive." });
        }

        const newStartAt = new Date(dateTimeISO);
        if (Number.isNaN(newStartAt.getTime())) {
            return res.status(400).json({ message: "dateTimeISO invalide." });
        }

        // ✅ staffId : si fourni => on change de coiffeur (B), sinon on garde (A)
        const newStaffId = staffId ? String(staffId) : String(appt.staffId);

        // évite report identique (même horaire + même coiffeur)
        if (+newStartAt === +new Date(appt.startAt) && newStaffId === String(appt.staffId)) {
            return res.status(400).json({ message: "Le nouveau créneau est identique à l'actuel." });
        }

        const newEndAt = dayjs(newStartAt).add(service.durationMinutes, "minute").toDate();

        // ✅ conflit sur staffId choisi
        const conflict = await AppointmentModel.findOne({
            _id: { $ne: appt._id },
            status: "booked",
            staffId: newStaffId,
            startAt: newStartAt,
        });

        if (conflict) {
            return res.status(409).json({ message: "Créneau déjà réservé pour ce coiffeur." });
        }

        // ✅ update
        appt.startAt = newStartAt;
        appt.endAt = newEndAt;
        appt.staffId = newStaffId as any;

        // ✅ total des reports
        appt.rescheduleCount = (appt.rescheduleCount ?? 0) + 1;

        await appt.save();

        return res.status(200).json(appt);
    } catch (error) {
        console.error("rescheduleAppointment error:", (error as Error).message);
        return res.status(500).json({ message: "Erreur serveur (report RDV)." });
    }
}
