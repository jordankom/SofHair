// Appels API owner pour les rendez-vous

import { apiClient } from "./apiClient";

//  Typage minimal des docs renvoyés par Mongoose + populate
export type OwnerAppointment = {
    _id: string;
    startAt: string;
    endAt: string;
    status: "booked" | "cancelled";

    userId: { firstName?: string; lastName?: string; email: string };
    serviceId: { name: string; category: string; price: number; durationMinutes: number };
};

//  GET /api/appointments?date=YYYY-MM-DD
export async function fetchOwnerAppointments(date: string): Promise<OwnerAppointment[]> {
    const res = await apiClient.get<OwnerAppointment[]>("/appointments", {
        params: { date },
    });
    return res.data;
}
