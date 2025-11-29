// BACKEND
// Modèle User pour MongoDB avec Mongoose.
// Rôle : représenter un utilisateur (client ou propriétaire de salon).

import { Schema, model, Document } from 'mongoose';

export type UserRole = 'client' | 'owner';

export interface IUser extends Document {
    email: string;
    passwordHash: string;  // mot de passe hashé (bcrypt)
    firstName?: string;
    lastName?: string;
    role: UserRole;
}

const userSchema = new Schema<IUser>(
    {
        email: { type: String, required: true, unique: true, lowercase: true },
        passwordHash: { type: String, required: true },
        firstName: { type: String },
        lastName: { type: String },
        role: { type: String, enum: ['client', 'owner'], required: true }
    },
    {
        timestamps: true
    }
);

export const UserModel = model<IUser>('User', userSchema);
