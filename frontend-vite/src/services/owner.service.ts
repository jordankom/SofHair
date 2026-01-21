// frontend/src/services/ownerApi.ts
import { apiClient } from "./apiClient";

/**
 * ===== Clients stats =====
 */
export type OwnerClientRow = {
    _id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    totalAppointments: number;
    cancelledCount: number;
    rescheduledCount: number;
};

export async function getOwnerClients() {
    const res = await apiClient.get<OwnerClientRow[]>("/owner/clients");
    return res.data;
}

/**
 * ===== Owner stats =====
 */
export type OwnerStatsResponse = {
    range: { from: string; to: string };
    kpis: {
        revenue: number;
        totalAppointments: number;
        totalReschedules: number;
    };
    rdvPerDay: Array<{ date: string; count: number }>;
    topServices: Array<{
        serviceId: string;
        name: string;
        category: string;
        count: number;
        revenue: number;
    }>;
    topStaff: Array<{
        staffId: string;
        firstName: string;
        lastName: string;
        count: number;
    }>;
};

export async function getOwnerStats(params: { from: string; to: string }) {
    const res = await apiClient.get<OwnerStatsResponse>("/owner/stats", { params });
    return res.data;
}
