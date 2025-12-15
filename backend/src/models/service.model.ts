// BACKEND Modèle Mongoose pour une prestation du salon (Service)

import { Schema, model, Document } from 'mongoose';

export interface IService extends Document {
    name: string;          // Nom de la prestation
    category: string;      // Catégorie (Coiffure, Coloration, Soin, Homme, etc.)
    price: number;         // Prix en euros
    durationMinutes: number; // Durée en minutes
    description?: string;  // Description optionnelle
    imageUrl: string;      // URL de l'image
    isActive: boolean;     // Prestation disponible ou non
}

const serviceSchema = new Schema<IService>(
    {
        name: { type: String, required: true },
        category: { type: String, required: true },
        price: { type: Number, required: true },
        durationMinutes: { type: Number, required: true },
        imageUrl: { type: String, required: true },
        description: { type: String },
        isActive: { type: Boolean, default: true },
    },
    {
        timestamps: true,
    }
);

export const ServiceModel = model<IService>('Service', serviceSchema);
