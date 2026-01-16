// FRONTEND
// Appels API RDV : disponibilités + création

import { apiClient } from "./apiClient";

export type AvailabilityItem = {
    dateTimeISO: string;
    available: boolean;
};
//  Type  pour afficher la liste
export type MyAppointment = {
    _id: string;
    startAt: string;
    endAt: string;
    status: "booked" | "cancelled";
    serviceId: {
        _id: string;
        name: string;
        category: string;
        price?: number;
        description?: string;
        durationMinutes?: number;
        imageUrl?: string;
    } | null;
};
export async function getAvailability(dateYYYYMMDD: string) {
    const res = await apiClient.get<AvailabilityItem[]>("/appointments/availability", {
        params: { date: dateYYYYMMDD },
    });
    return res.data;
}

export async function createAppointment(payload: { serviceId: string; dateTimeISO: string }) {
    const res = await apiClient.post("/appointments", payload);
    return res.data;
}

/**
 * GET /appointments/my
 * Renvoie la liste des RDV de l'utilisateur connecté
 */
export async function getMyAppointments() {
    const res = await apiClient.get<MyAppointment[]>("/appointments/my");
    return res.data;
}

/**
 * PATCH /appointments/:id/cancel
 * Annule un RDV du client connecté
 */
export async function cancelAppointment(appointmentId: string) {
    const res = await apiClient.patch(`/appointments/${appointmentId}/cancel`);
    return res.data;
}

// Déplacer un RDV vers un nouveau créneau
export async function rescheduleAppointment(appointmentId: string, payload: { dateTimeISO: string }) {
    const res = await apiClient.patch(`/appointments/${appointmentId}/reschedule`, payload);
    return res.data;
}
