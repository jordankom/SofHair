// Modèle Promotion : promo auto appliquée sur un service / catégorie / tout le salon

import { Schema, model, Document, Types } from "mongoose";

export type PromoType = "percent" | "amount";
export type PromoTargetType = "all" | "category" | "service";

export interface IPromotion extends Document {
    name: string;
    type: PromoType;              // percent | amount
    value: number;                // 10 => -10% ; 5 => -5€
    targetType: PromoTargetType;  // all | category | service

    targetCategory?: string;      // si targetType="category"
    targetServiceId?: Types.ObjectId; // si targetType="service"

    startAt?: Date;
    endAt?: Date;
    isActive: boolean;
}

const promotionSchema = new Schema<IPromotion>(
    {
        name: { type: String, required: true, trim: true },
        type: { type: String, enum: ["percent", "amount"], required: true },
        value: { type: Number, required: true, min: 0 },

        targetType: { type: String, enum: ["all", "category", "service"], required: true },
        targetCategory: { type: String, trim: true },
        targetServiceId: { type: Schema.Types.ObjectId, ref: "Service" },

        startAt: { type: Date },
        endAt: { type: Date },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

/**
 *  Validation doc (sans next) -> évite "next is not a function"
 * On invalide les champs manquants selon targetType.
 */
promotionSchema.pre("validate", function (this: IPromotion) {
    if (this.targetType === "category" && !this.targetCategory) {
        this.invalidate("targetCategory", "targetCategory requis si targetType=category");
    }

    if (this.targetType === "service" && !this.targetServiceId) {
        this.invalidate("targetServiceId", "targetServiceId requis si targetType=service");
    }

    // Si dates incohérentes
    if (this.startAt && this.endAt && this.endAt < this.startAt) {
        this.invalidate("endAt", "endAt doit être >= startAt");
    }
});

export const PromotionModel = model<IPromotion>("Promotion", promotionSchema);
