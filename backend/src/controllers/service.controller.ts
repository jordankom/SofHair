// Contrôleur des prestations (services).
// Pour l'instant :
// - GET /api/services → liste toutes les prestations avec filtres simples (catégorie)

import { Request, Response } from 'express';
import { ServiceModel } from '../models/service.model';

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
