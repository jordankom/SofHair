// backend/src/controllers/owner.controller.ts
import { Response } from "express";
import dayjs from "dayjs";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { UserModel } from "../models/user.model";
import { AppointmentModel } from "../models/appointment.model";

//  helper pour remplir tous les jours de la période
function buildDayBuckets(from: string, to: string) {
    const start = dayjs(from).startOf("day");
    const end = dayjs(to).startOf("day");

    const days: { date: string; count: number }[] = [];
    let cur = start;

    // inclusif
    while (cur.isBefore(end) || cur.isSame(end, "day")) {
        days.push({ date: cur.format("YYYY-MM-DD"), count: 0 });
        cur = cur.add(1, "day");
    }
    return days;
}

export async function listClientsStats(req: AuthenticatedRequest, res: Response) {
    try {
        const clients = await UserModel.aggregate([
            { $match: { role: "client" } },
            {
                $lookup: {
                    from: "appointments",
                    localField: "_id",
                    foreignField: "userId",
                    as: "appts",
                },
            },
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

export async function getOwnerStats(req: AuthenticatedRequest, res: Response) {
    try {
        const from = String(req.query.from || "").trim();
        const to = String(req.query.to || "").trim();

        if (!from || !to) {
            return res.status(400).json({ message: "from et to sont requis (YYYY-MM-DD)." });
        }

        const start = dayjs(from).startOf("day");
        const end = dayjs(to).endOf("day");

        if (!start.isValid() || !end.isValid()) {
            return res.status(400).json({ message: "Dates invalides. Format attendu: YYYY-MM-DD." });
        }

        const baseMatch = {
            status: "booked",
            startAt: { $gte: start.toDate(), $lte: end.toDate() },
        };

        const kpiAgg = await AppointmentModel.aggregate([
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

            //  utilise pricePaid si présent (plus fiable), sinon service.price
            {
                $addFields: {
                    effectivePrice: {
                        $ifNull: ["$pricePaid", { $ifNull: ["$service.price", 0] }],
                    },
                    resCount: { $ifNull: ["$rescheduleCount", 0] },
                },
            },

            {
                $group: {
                    _id: null,
                    totalAppointments: { $sum: 1 },
                    revenue: { $sum: "$effectivePrice" },
                    totalReschedules: { $sum: "$resCount" },
                },
            },
            { $project: { _id: 0, totalAppointments: 1, revenue: 1, totalReschedules: 1 } },
        ]);

        const kpis = kpiAgg[0] || { totalAppointments: 0, revenue: 0, totalReschedules: 0 };

        const perDayAgg = await AppointmentModel.aggregate([
            { $match: baseMatch },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$startAt" } },
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
            { $project: { _id: 0, date: "$_id", count: 1 } },
        ]);

        //fill days manquants -> pas de graphe "vide"
        const buckets = buildDayBuckets(from, to);
        const map = new Map<string, number>();
        for (const d of perDayAgg) map.set(d.date, Number(d.count ?? 0));
        const rdvPerDayFilled = buckets.map((b) => ({
            date: b.date,
            count: map.get(b.date) ?? 0,
        }));

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
                    effectivePrice: {
                        $ifNull: ["$pricePaid", { $ifNull: ["$service.price", 0] }],
                    },
                },
            },

            {
                $group: {
                    _id: "$serviceId",
                    name: { $first: "$service.name" },
                    category: { $first: "$service.category" },
                    count: { $sum: 1 },
                    revenue: { $sum: "$effectivePrice" },
                },
            },
            { $sort: { count: -1 } },
            { $limit: 5 },
            { $project: { _id: 0, serviceId: "$_id", name: 1, category: 1, count: 1, revenue: 1 } },
        ]);

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
            { $project: { _id: 0, staffId: "$_id", firstName: 1, lastName: 1, count: 1 } },
        ]);

        return res.json({
            range: { from, to },
            kpis: {
                revenue: kpis.revenue,
                totalAppointments: kpis.totalAppointments,
                totalReschedules: kpis.totalReschedules,
            },
            rdvPerDay: rdvPerDayFilled, // ✅ CHANGED
            topServices: topServicesAgg,
            topStaff: topStaffAgg,
        });
    } catch (error) {
        console.error("getOwnerStats error:", (error as Error).message);
        return res.status(500).json({ message: "Erreur serveur (stats owner)." });
    }
}
