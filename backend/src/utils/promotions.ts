import dayjs from "dayjs";
import { IService } from "../models/service.model";
import { PromotionModel, IPromotion } from "../models/promotion.model";

type PromoResult = {
    promo: IPromotion | null;
    priceFinal: number;
};

function applyPromoToPrice(base: number, promo: IPromotion): number {
    if (promo.type === "percent") {
        const p = base * (1 - promo.value / 100);
        return Math.max(0, Math.round(p * 100) / 100);
    }
    // amount
    return Math.max(0, Math.round((base - promo.value) * 100) / 100);
}

export async function findBestActivePromoForService(service: IService): Promise<PromoResult> {
    const now = dayjs();

    const promos = await PromotionModel.find({
        isActive: true,
        $and: [
            { $or: [{ startAt: { $exists: false } }, { startAt: null }, { startAt: { $lte: now.toDate() } }] },
            { $or: [{ endAt: { $exists: false } }, { endAt: null }, { endAt: { $gte: now.toDate() } }] },
        ],
        $or: [
            { targetType: "all" },
            { targetType: "category", targetCategory: service.category },
            { targetType: "service", targetServiceId: service._id },
        ],
    }).sort({ createdAt: -1 });

    // Si pas de promo
    if (!promos.length) return { promo: null, priceFinal: service.price };

    // On choisit la promo qui donne le prix final le plus bas
    let best = promos[0];
    let bestPrice = applyPromoToPrice(service.price, best);

    for (const p of promos.slice(1)) {
        const price = applyPromoToPrice(service.price, p);
        if (price < bestPrice) {
            best = p;
            bestPrice = price;
        }
    }

    return { promo: best, priceFinal: bestPrice };
}
