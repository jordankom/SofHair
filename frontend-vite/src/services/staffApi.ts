// FRONTEND - services/staffApi.ts
// API pour la gestion de l'équipe côté owner

import { apiClient } from "./apiClient";

export type Staff = {
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
    isActive: boolean;
};

// GET /api/owner/staff
export async function getStaffList() {
    const res = await apiClient.get<Staff[]>("/owner/staff");
    return res.data;
}

// POST /api/owner/staff
export async function createStaff(payload: { firstName: string; lastName: string; email?: string }) {
    const res = await apiClient.post<Staff>("/owner/staff", payload);
    return res.data;
}
