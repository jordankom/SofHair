// BACKEND
// Service "services" : logique métier

import { ServiceModel } from "../models/service.model";

//  Renvoie toutes les catégories existantes (uniques) en DB
export async function getAllCategories(): Promise<string[]> {
    // distinct() est parfait pour récupérer une liste unique
    const categories = await ServiceModel.distinct("category");

    // On nettoie (pas de null/empty) + tri
    return categories
        .filter((c) => typeof c === "string" && c.trim().length > 0)
        .sort((a, b) => a.localeCompare(b));
}


