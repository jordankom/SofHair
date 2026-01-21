import { apiClient } from "./apiClient";

export interface Service {
    _id: string;
    name: string;
    category: string;
    price: number;
    durationMinutes: number;
    imageUrl: string;
    isActive: boolean;

    // (ton backend peut renvoyer ces champs “enriched”)
    description?: string;
    priceFinal?: number;
    promoApplied?: any;
}

export type CreateServicePayload = {
    name: string;
    category: string;
    price: number;
    durationMinutes: number;
    description?: string;
    imageUrl?: string;
    isActive?: boolean;
};

//  update payload = même structure (tous champs possibles)
export type UpdateServicePayload = Partial<CreateServicePayload>;

export async function fetchServices(category?: string): Promise<Service[]> {
    const params: any = {};
    if (category && category !== "Toutes") params.category = category;

    const res = await apiClient.get<Service[]>("/services", { params });
    return res.data;
}

export async function createService(payload: CreateServicePayload): Promise<Service> {
    const res = await apiClient.post<Service>("/services", payload);
    return res.data;
}

//  PATCH
export async function updateService(id: string, payload: UpdateServicePayload): Promise<Service> {
    const res = await apiClient.patch<Service>(`/services/${id}`, payload);
    return res.data;
}

//  DELETE
export async function deleteService(id: string): Promise<void> {
    await apiClient.delete(`/services/${id}`);
}
