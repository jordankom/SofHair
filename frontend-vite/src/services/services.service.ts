// Appels API liés aux prestations/services

import { apiClient } from "./apiClient";

export interface ServiceItem {
    _id: string;
    name: string;
    category: string;
    price?: number;
    imageUrl?: string; // ou "image" selon ton backend
    description?: string;
}

export async function getServices(category?: string): Promise<ServiceItem[]> {
    const res = await apiClient.get<ServiceItem[]>("/services", {
        params: category ? { category } : {},
    });
    return res.data;
}

export async function getServiceCategories(): Promise<string[]> {
    const res = await apiClient.get<string[]>("/services/categories");
    return res.data;
}