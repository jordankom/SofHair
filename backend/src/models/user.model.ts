// Définition du modèle User avec Mongoose + TypeScript

import mongoose, { Document, Model } from 'mongoose';
import bcrypt from 'bcrypt';

export type UserRole = 'client' | 'owner';

// Interface TypeScript représentant un document User
export interface IUser extends Document {
    email: string;
    password: string;
    role: UserRole;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

// Définition du schema Mongoose
const userSchema = new mongoose.Schema<IUser>(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        password: {
            type: String,
            required: true,
            minlength: 8
        },
        role: {
            type: String,
            enum: ['client', 'owner'],
            default: 'client'
        }
    },
    { timestamps: true }
);

// Hook de pré-sauvegarde pour hasher le mot de passe
userSchema.pre('save', async function (next) {
    const user = this as IUser;

    // Si le mot de passe n'a pas changé, on ne rehash pas
    if (!user.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
        next();
    } catch (error) {
        next(error as Error);
    }
});

// Méthode d'instance pour comparer un mot de passe en clair au hash stocké
userSchema.methods.comparePassword = function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

// Création du modèle User
const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default User;
