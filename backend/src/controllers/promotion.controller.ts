import { Response } from "express";
import dayjs from "dayjs";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { PromotionModel } from "../models/promotion.model";

export async function ownerListPromotions(req: AuthenticatedRequest, res: Response) {
    try {
        const promos = await PromotionModel.find().sort({ createdAt: -1 });
        return res.json(promos);
    } catch (error) {
        console.error("ownerListPromotions error:", (error as Error).message);
        return res.status(500).json({ message: "Erreur serveur (liste promotions)." });
    }
}

export async function ownerCreatePromotion(req: AuthenticatedRequest, res: Response) {
    try {
        const {
            name,
            type,
            value,
            targetType,
            targetCategory,
            targetServiceId,
            startAt,
            endAt,
            isActive,
        } = req.body;

        // mini validations
        if (!name || !type || typeof value !== "number" || !targetType) {
            return res.status(400).json({ message: "Champs manquants (name/type/value/targetType)." });
        }

        const promo = await PromotionModel.create({
            name,
            type,
            value,
            targetType,
            targetCategory: targetType === "category" ? targetCategory : undefined,
            targetServiceId: targetType === "service" ? targetServiceId : undefined,
            startAt: startAt ? dayjs(startAt).toDate() : undefined,
            endAt: endAt ? dayjs(endAt).toDate() : undefined,
            isActive: typeof isActive === "boolean" ? isActive : true,
        });

        return res.status(201).json(promo);
    } catch (error) {
        // Ici tu verras si c'est une validation mongoose (targetCategory missing etc.)
        console.error("ownerCreatePromotion error:", (error as Error).message);
        return res.status(500).json({ message: (error as Error).message || "Erreur serveur (création promotion)." });
    }
}

export async function ownerTogglePromotion(req: AuthenticatedRequest, res: Response) {
    try {
        const id = String(req.params.id || "");
        const { isActive } = req.body as { isActive: boolean };

        const promo = await PromotionModel.findByIdAndUpdate(id, { isActive }, { new: true });
        if (!promo) return res.status(404).json({ message: "Promotion introuvable." });

        return res.json(promo);
    } catch (error) {
        console.error("ownerTogglePromotion error:", (error as Error).message);
        return res.status(500).json({ message: "Erreur serveur (toggle promotion)." });
    }
}

export async function ownerDeletePromotion(req: AuthenticatedRequest, res: Response) {
    try {
        const id = String(req.params.id || "");
        const promo = await PromotionModel.findByIdAndDelete(id);
        if (!promo) return res.status(404).json({ message: "Promotion introuvable." });

        return res.json({ message: "Promotion supprimée." });
    } catch (error) {
        console.error("ownerDeletePromotion error:", (error as Error).message);
        return res.status(500).json({ message: "Erreur serveur (suppression promotion)." });
    }
}
