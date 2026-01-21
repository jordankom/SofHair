// Contrôleur des prestations (services).
// GET /api/services → liste toutes les prestations avec filtres simples (catégorie)
// ✅ Ajout : calcule priceFinal + promoApplied (affichage promo côté front)

import { Request, Response } from "express";
import { ServiceModel } from "../models/service.model";
import { getAllCategories } from "../services/service.service";
import { findBestActivePromoForService } from "../utils/promotions";

export async function getServices(req: Request, res: Response) {
    try {
        const { category } = req.query;

        const query: any = {};
        if (category && typeof category === "string" && category !== "Toutes") {
            query.category = category;
        }

        const services = await ServiceModel.find(query).sort({ name: 1 });

        //  Pour chaque service : calc promo + priceFinal (pour affichage)
        const enriched = await Promise.all(
            services.map(async (s) => {
                const { promo, priceFinal } = await findBestActivePromoForService(s);

                return {
                    ...s.toObject(),
                    priceFinal,
                    promoApplied: promo
                        ? {
                            _id: promo._id,
                            name: promo.name,
                            type: promo.type,
                            value: promo.value,
                        }
                        : null,
                };
            })
        );

        return res.json(enriched);
    } catch (error) {
        console.error("[SERVICES] Erreur getServices :", error);
        return res.status(500).json({ message: "Erreur lors de la récupération des prestations." });
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
        const { name, category, price, durationMinutes, description, imageUrl } = req.body;

        if (!name || !category || !price || !durationMinutes) {
            return res.status(400).json({
                message: "Champs manquants (name, category, price, durationMinutes).",
            });
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

//  PATCH /api/services/:id
export async function updateService(req: Request, res: Response) {
    try {
        const id = String(req.params.id || "");

        const { name, category, price, durationMinutes, description, imageUrl, isActive } = req.body;

        // mini validation : si fourni, pas vide
        const patch: any = {};
        if (typeof name === "string") patch.name = name.trim();
        if (typeof category === "string") patch.category = category.trim();
        if (price != null) patch.price = Number(price);
        if (durationMinutes != null) patch.durationMinutes = Number(durationMinutes);
        if (typeof description === "string") patch.description = description.trim() || undefined;
        if (typeof imageUrl === "string") patch.imageUrl = imageUrl.trim();
        if (typeof isActive === "boolean") patch.isActive = isActive;

        // garde-fou : au moins un champ
        if (Object.keys(patch).length === 0) {
            return res.status(400).json({ message: "Aucune donnée à mettre à jour." });
        }

        const updated = await ServiceModel.findByIdAndUpdate(id, patch, {
            new: true,
            runValidators: true,
        });

        if (!updated) return res.status(404).json({ message: "Prestation introuvable." });

        return res.json(updated);
    } catch (e) {
        console.error("Erreur updateService:", e);
        return res.status(500).json({ message: "Erreur serveur lors de la modification." });
    }
}

//  DELETE /api/services/:id
export async function deleteService(req: Request, res: Response) {
    try {
        const id = String(req.params.id || "");
        const deleted = await ServiceModel.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ message: "Prestation introuvable." });
        return res.json({ message: "Prestation supprimée." });
    } catch (e) {
        console.error("Erreur deleteService:", e);
        return res.status(500).json({ message: "Erreur serveur lors de la suppression." });
    }
}