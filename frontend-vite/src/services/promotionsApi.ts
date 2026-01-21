
// API Owner Promotions : list / create / toggle / delete

import { apiClient } from "./apiClient";

export type PromoType = "percent" | "amount";
export type PromoTargetType = "all" | "category" | "service";

export type Promotion = {
    _id: string;
    name: string;
    type: PromoType;
    value: number;

    targetType: PromoTargetType;
    targetCategory?: string;
    targetServiceId?: string;

    startAt?: string;
    endAt?: string;
    isActive: boolean;

    createdAt: string;
    updatedAt: string;
};

export type CreatePromotionPayload = {
    name: string;
    type: PromoType;
    value: number;
    targetType: PromoTargetType;

    // selon targetType
    targetCategory?: string;
    targetServiceId?: string;

    // optionnel
    startAt?: string; // ISO ou YYYY-MM-DD
    endAt?: string;
    isActive?: boolean;
};

export async function ownerListPromotions() {
    const res = await apiClient.get<Promotion[]>("/owner/promotions");
    return res.data;
}

export async function ownerCreatePromotion(payload: CreatePromotionPayload) {
    const res = await apiClient.post<Promotion>("/owner/promotions", payload);
    return res.data;
}

export async function ownerTogglePromotion(id: string, isActive: boolean) {
    const res = await apiClient.patch<Promotion>(`/owner/promotions/${id}/toggle`, { isActive });
    return res.data;
}

export async function ownerDeletePromotion(id: string) {
    const res = await apiClient.delete(`/owner/promotions/${id}`);
    return res.data;
}
