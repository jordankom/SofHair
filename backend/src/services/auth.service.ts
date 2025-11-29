// BACKEND
// Service d'authentification :
// - vérifie l'email + mot de passe
// - génère un JWT avec id + role de l'utilisateur

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel, IUser } from '../models/user.model';
import  env  from '../config/env'; // fichier qui lit process.env

export interface RegisterPayload {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
}

export interface LoginResult {
    token: string;
    user: {
        id: string;
        email: string;
        role: string;
        firstName?: string;
        lastName?: string;
    };
}

export async function loginUser(email: string, password: string): Promise<LoginResult> {
    // 1. On cherche l'utilisateur par email
    const user = await UserModel.findOne({ email });
    if (!user) {
        throw new Error('EMAIL_OR_PASSWORD_INVALID');
    }

    // 2. On compare le mot de passe (texte) avec le hash stocké
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
        throw new Error('EMAIL_OR_PASSWORD_INVALID');
    }

    // 3. On génère le JWT
    const token = jwt.sign(
        {
            sub: user._id.toString(), // subject = id de l'utilisateur
            role: user.role
        },
        env.jwtSecret, // clé secrete dans .env
        {
            expiresIn: '7d' // token valide 7 jours
        }
    );

    return {
        token,
        user: {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName
        }
    };
}

export async function registerUser(payload: RegisterPayload) {
    const { email, password, firstName, lastName } = payload;

    // Vérifier si l'email existe déjà
    const existing = await UserModel.findOne({ email });
    if (existing) {
        throw new Error('EMAIL_ALREADY_USED');
    }

    // Hasher le mot de passe
    const passwordHash = await bcrypt.hash(password, 10);

    // On crée un utilisateur avec rôle 'client'
    const user = await UserModel.create({
        email,
        passwordHash,
        firstName,
        lastName,
        role: 'client' // 🔵 ici on force le rôle client pour le register public
    });

    // Génération du token, même logique que login
    const token = jwt.sign(
        {
            sub: user._id.toString(),
            role: user.role
        },
        env.jwtSecret,
        { expiresIn: '7d' }
    );

    return {
        token,
        user: {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
            firstName: user.firstName,
            lastName: user.lastName
        }
    };
}

