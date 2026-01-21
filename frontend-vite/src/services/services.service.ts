import { apiClient } from "./apiClient";

export type PromoApplied = {
    _id: string;
    name: string;
    type: "percent" | "amount";
    value: number;
};

export type ServiceItem = {
    _id: string;
    name: string;
    category: string;

    price: number;
    durationMinutes: number;
    imageUrl?: string;
    description?: string;
    isActive?: boolean;

    //  renvoyé par le backend si promo
    priceFinal?: number;
    promoApplied?: PromoApplied | null;
};

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
