// FRONTEND
// Service API pour les prestations (services)

import { apiClient } from './apiClient';

// Type aligné sur le modèle backend
export interface Service {
    _id: string;
    name: string;
    category: string;
    price: number;
    durationMinutes: number;
    imageUrl: string;
    isActive: boolean;
}

// Récupère toutes les prestations, avec un filtre catégorie facultatif
export async function fetchServices(category?: string): Promise<Service[]> {
    const params: any = {};
    if (category && category !== 'Toutes') {
        params.category = category;
    }

    const res = await apiClient.get<Service[]>('/services', { params });
    return res.data;
}

export async function createService(payload: CreateServicePayload): Promise<Service> {
    const res = await apiClient.post<Service>("/services", payload);
    return res.data;
}