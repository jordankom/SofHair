// FRONTEND - src/services/staffApi.ts
import { apiClient } from "./apiClient";

export type Staff = {
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
    isActive: boolean;
    avatarUrl?: string;
    schedule?: { slotMinutes?: number }; // si tu l’utilises côté UI
};

export type OwnerStaffAppointment = {
    _id: string;
    startAt: string;
    endAt: string;
    userId?: { firstName?: string; lastName?: string; email?: string };
    serviceId?: { name?: string; category?: string; price?: number; durationMinutes?: number };
};

// GET /api/owner/staff
export async function getStaffList() {
    const res = await apiClient.get<Staff[]>("/owner/staff");
    return res.data;
}

// POST /api/owner/staff
export async function createStaff(payload: {
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    avatarUrl?: string;
}) {
    const res = await apiClient.post("/owner/staff", payload);
    return res.data;
}

// PATCH /api/owner/staff/:id/toggle
export async function toggleStaff(staffId: string, isActive: boolean) {
    const res = await apiClient.patch(`/owner/staff/${staffId}/toggle`, { isActive });
    return res.data;
}

// GET /api/owner/staff/:id/schedule?from&to
export async function getStaffSchedule(staffId: string, fromYYYYMMDD: string, toYYYYMMDD: string) {
    const res = await apiClient.get<OwnerStaffAppointment[]>(`/owner/staff/${staffId}/schedule`, {
        params: { from: fromYYYYMMDD, to: toYYYYMMDD },
    });
    return res.data;
}
