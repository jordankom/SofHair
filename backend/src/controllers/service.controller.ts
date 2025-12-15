// Contrôleur des prestations (services).
// Pour l'instant :
// - GET /api/services → liste toutes les prestations avec filtres simples (catégorie)

import { Request, Response } from 'express';
import { ServiceModel } from '../models/service.model';
import { getAllCategories } from "../services/service.service";

export async function getServices(req: Request, res: Response) {
    try {
        const { category } = req.query;

        const query: any = {};
        if (category && typeof category === 'string' && category !== 'Toutes') {
            query.category = category;
        }

        const services = await ServiceModel.find(query).sort({ name: 1 });

        return res.json(services);
    } catch (error) {
        console.error('[SERVICES] Erreur getServices :', error);
        return res.status(500).json({ message: 'Erreur lors de la récupération des prestations.' });
    }
}

export async function listServiceCategories(req: Request, res: Response) {
    try {
        const categories = await getAllCategories();
        return res.status(200).json(categories);
    } catch (err) {
        console.error("[SERVICES] Erreur listServiceCategories:", err);
        return res.status(500).json({ message: "SERVER_ERROR" });
    }
}

export async function createService(req: Request, res: Response) {
    try {
        // Champs reçus du front
        const { name, category, price, durationMinutes, description, imageUrl } = req.body;

        // évite de créer des prestations vides
        if (!name || !category || !price || !durationMinutes) {
            return res.status(400).json({ message: "Champs manquants (name, category, price, durationMinutes)." });
        }

        const created = await ServiceModel.create({
            name,
            category,
            price,
            durationMinutes,
            description,
            imageUrl,
        });

        return res.status(201).json(created);
    } catch (e) {
        console.error("Erreur createService:", e);
        return res.status(500).json({ message: "Erreur serveur lors de la création." });
    }
}