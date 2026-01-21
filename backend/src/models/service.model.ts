import { Schema, model, Document } from "mongoose";

export interface IService extends Document {
    name: string;
    category: string;
    price: number;
    durationMinutes: number;
    description?: string;
    imageUrl: string;
    isActive: boolean;
}

const serviceSchema = new Schema<IService>(
    {
        name: { type: String, required: true },
        category: { type: String, required: true },
        price: { type: Number, required: true },
        durationMinutes: { type: Number, required: true },


        imageUrl: { type: String, default: "" },

        description: { type: String },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export const ServiceModel = model<IService>("Service", serviceSchema);
