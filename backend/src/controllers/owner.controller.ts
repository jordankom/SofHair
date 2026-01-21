// backend/src/controllers/owner.controller.ts
import { Response } from "express";
import dayjs from "dayjs";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { UserModel } from "../models/user.model";
import { AppointmentModel } from "../models/appointment.model";

/**
 * GET /api/owner/clients
 * Liste des clients + stats RDV (total / annulés / reportés)
 */
export async function listClientsStats(req: AuthenticatedRequest, res: Response) {
    try {
        // sécurité déjà gérée par requireAuth + requireOwner
        const clients = await UserModel.aggregate([
            { $match: { role: "client" } },

            // jointure sur appointments
            {
                $lookup: {
                    from: "appointments",
                    localField: "_id",
                    foreignField: "userId",
                    as: "appts",
                },
            },

            // stats demandées
            {
                $addFields: {
                    totalAppointments: { $size: "$appts" },

                    cancelledCount: {
                        $size: {
                            $filter: {
                                input: "$appts",
                                as: "a",
                                cond: { $eq: ["$$a.status", "cancelled"] },
                            },
                        },
                    },

                    // reporté = somme des rescheduleCount (si un RDV est reporté 3 fois => +3)
                    rescheduledCount: {
                        $sum: {
                            $map: {
                                input: "$appts",
                                as: "a",
                                in: { $ifNull: ["$$a.rescheduleCount", 0] },
                            },
                        },
                    },
                },
            },

            {
                $project: {
                    passwordHash: 0,
                    appts: 0,
                    __v: 0,
                },
            },

            { $sort: { lastName: 1, firstName: 1 } },
        ]);

        return res.json(clients);
    } catch (error) {
        console.error("listClientsStats error:", (error as Error).message);
        return res.status(500).json({ message: "Erreur serveur (clients owner)." });
    }
}

/**
 * GET /api/owner/stats?from=YYYY-MM-DD&to=YYYY-MM-DD
 * ✅ booked uniquement (non annulés)
 * Renvoie tout ce qu’il faut pour la page Stats en 1 call :
 * - kpis (CA, rdv, reports)
 * - rdvPerDay (graph)
 * - topServices
 * - topStaff
 */
export async function getOwnerStats(req: AuthenticatedRequest, res: Response) {
    try {
        const from = String(req.query.from || "").trim();
        const to = String(req.query.to || "").trim();

        if (!from || !to) {
            return res.status(400).json({ message: "from et to sont requis (YYYY-MM-DD)." });
        }

        // bornes inclusives (du début de journée "from" à fin de journée "to")
        const start = dayjs(from).startOf("day");
        const end = dayjs(to).endOf("day");

        if (!start.isValid() || !end.isValid()) {
            return res.status(400).json({ message: "Dates invalides. Format attendu: YYYY-MM-DD." });
        }

        // Pipeline commun : booked uniquement + plage de dates
        const baseMatch = {
            status: "booked",
            startAt: { $gte: start.toDate(), $lte: end.toDate() },
        };

        /**
         * 1) KPI + agrégations (CA / count / total reports)
         * On lookup service pour récupérer price.
         */
        const kpiAgg = await AppointmentModel.aggregate([
            { $match: baseMatch },

            // join service pour price
            {
                $lookup: {
                    from: "services",
                    localField: "serviceId",
                    foreignField: "_id",
                    as: "service",
                },
            },
            { $unwind: "$service" },

            // calc safe
            {
                $addFields: {
                    servicePrice: { $ifNull: ["$service.price", 0] },
                    resCount: { $ifNull: ["$rescheduleCount", 0] },
                },
            },

            {
                $group: {
                    _id: null,
                    totalAppointments: { $sum: 1 },
                    revenue: { $sum: "$servicePrice" },
                    totalReschedules: { $sum: "$resCount" },
                },
            },

            {
                $project: {
                    _id: 0,
                    totalAppointments: 1,
                    revenue: 1,
                    totalReschedules: 1,
                },
            },
        ]);

        const kpis = kpiAgg[0] || { totalAppointments: 0, revenue: 0, totalReschedules: 0 };

        /**
         * 2) RDV par jour (graph)
         * Group by YYYY-MM-DD
         */
        const perDayAgg = await AppointmentModel.aggregate([
            { $match: baseMatch },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$startAt" },
                    },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    count: 1,
                },
            },
        ]);

        /**
         * 3) Top prestations (booked uniquement)
         * - count
         * - revenue (sum price)
         */
        const topServicesAgg = await AppointmentModel.aggregate([
            { $match: baseMatch },
            {
                $lookup: {
                    from: "services",
                    localField: "serviceId",
                    foreignField: "_id",
                    as: "service",
                },
            },
            { $unwind: "$service" },
            {
                $addFields: {
                    servicePrice: { $ifNull: ["$service.price", 0] },
                },
            },
            {
                $group: {
                    _id: "$serviceId",
                    name: { $first: "$service.name" },
                    category: { $first: "$service.category" },
                    count: { $sum: 1 },
                    revenue: { $sum: "$servicePrice" },
                },
            },
            { $sort: { count: -1 } },
            { $limit: 5 },
            {
                $project: {
                    _id: 0,
                    serviceId: "$_id",
                    name: 1,
                    category: 1,
                    count: 1,
                    revenue: 1,
                },
            },
        ]);

        /**
         * 4) Top coiffeurs (booked uniquement)
         */
        const topStaffAgg = await AppointmentModel.aggregate([
            { $match: baseMatch },
            {
                $lookup: {
                    from: "staff",
                    localField: "staffId",
                    foreignField: "_id",
                    as: "staff",
                },
            },
            { $unwind: "$staff" },
            {
                $group: {
                    _id: "$staffId",
                    firstName: { $first: "$staff.firstName" },
                    lastName: { $first: "$staff.lastName" },
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 } },
            { $limit: 5 },
            {
                $project: {
                    _id: 0,
                    staffId: "$_id",
                    firstName: 1,
                    lastName: 1,
                    count: 1,
                },
            },
        ]);

        return res.json({
            range: { from, to },
            kpis: {
                revenue: kpis.revenue,
                totalAppointments: kpis.totalAppointments,
                totalReschedules: kpis.totalReschedules,
            },
            rdvPerDay: perDayAgg,       // [{date:"2026-01-10", count: 4}, ...]
            topServices: topServicesAgg, // [{name, count, revenue}, ...]
            topStaff: topStaffAgg,       // [{firstName,lastName,count}, ...]
        });
    } catch (error) {
        console.error("getOwnerStats error:", (error as Error).message);
        return res.status(500).json({ message: "Erreur serveur (stats owner)." });
    }
}
