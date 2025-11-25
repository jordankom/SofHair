// Toute la logique métier liée à l'Auth (inscription, login, token)

import jwt from 'jsonwebtoken';
import User, { IUser, UserRole } from '../models/user.model';
import env from '../config/env';

interface AuthPayload {
    id: string;
    role: UserRole;
}

export interface AuthResult {
    user: {
        id: string;
        email: string;
        role: UserRole;
    };
    token: string;
}

// Fonction pour signer un JWT à partir d'un utilisateur
function signToken(user: IUser): string {
    const payload: AuthPayload = {
        id: user._id.toString(),
        role: user.role
    };

    return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

// Service : inscription utilisateur
export async function registerUser(email: string, password: string, role: UserRole = 'client'): Promise<AuthResult> {
    const existing = await User.findOne({ email });

    if (existing) {
        const error = new Error('Un compte existe déjà avec cet email.');
        (error as any).statusCode = 409;
        throw error;
    }

    const user = await User.create({ email, password, role });

    const token = signToken(user);

    return {
        user: {
            id: user._id.toString(),
            email: user.email,
            role: user.role
        },
        token
    };
}

// Service : login utilisateur
export async function loginUser(email: string, password: string): Promise<AuthResult> {
    const user = await User.findOne({ email });

    if (!user) {
        const error = new Error('Identifiants invalides.');
        (error as any).statusCode = 401;
        throw error;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        const error = new Error('Identifiants invalides.');
        (error as any).statusCode = 401;
        throw error;
    }

    const token = signToken(user);

    return {
        user: {
            id: user._id.toString(),
            email: user.email,
            role: user.role
        },
        token
    };
}
