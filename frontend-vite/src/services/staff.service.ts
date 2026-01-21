import { apiClient } from "./apiClient";

export type StaffItem = {
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
    isActive: boolean;
};

export async function getStaff() {
    const res = await apiClient.get<StaffItem[]>("/staff");
    return res.data;
}
