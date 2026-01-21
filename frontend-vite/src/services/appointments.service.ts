import { apiClient } from "./apiClient";

export type AvailabilityItem = {
    dateTimeISO: string;
    available: boolean;
};

export type MyAppointment = {
    _id: string;
    startAt: string;
    endAt: string;
    status: "booked" | "cancelled";
    rescheduleCount?: number;
    staffId?: string; // (si tu veux l'afficher + tard)
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

//  dispo par coiffeur
export async function getAvailability(dateYYYYMMDD: string, staffId: string) {
    const res = await apiClient.get<AvailabilityItem[]>("/appointments/availability", {
        params: { date: dateYYYYMMDD, staffId },
    });
    return res.data;
}

// création rdv avec coiffeur
export async function createAppointment(payload: { serviceId: string; dateTimeISO: string; staffId: string }) {
    const res = await apiClient.post("/appointments", payload);
    return res.data;
}

export async function getMyAppointments() {
    const res = await apiClient.get<MyAppointment[]>("/appointments/my");
    return res.data;
}

export async function cancelAppointment(appointmentId: string) {
    const res = await apiClient.patch(`/appointments/${appointmentId}/cancel`);
    return res.data;
}

// ✅ report : staffId optionnel => si tu veux changer le coiffeur (B)
export async function rescheduleAppointment(
    appointmentId: string,
    payload: { dateTimeISO: string; staffId?: string }
) {
    const res = await apiClient.patch(`/appointments/${appointmentId}/reschedule`, payload);
    return res.data;
}
