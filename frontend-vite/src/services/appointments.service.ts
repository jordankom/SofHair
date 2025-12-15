// FRONTEND
// Appels API RDV : disponibilités + création

import { apiClient } from "./apiClient";

export type AvailabilityItem = {
    dateTimeISO: string;
    available: boolean;
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
