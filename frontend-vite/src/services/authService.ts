// FRONTEND
// Services d'authentification :
// - loginRequest : connexion (email + mot de passe)
// - registerRequest : création de compte
// Les deux renvoient un token + un user typé AuthUser.

import { apiClient } from './apiClient';
// ⬇️ On importe bien le type AuthUser depuis le contexte (named export)
import type { AuthUser } from '../context/AuthContext';

// Réponse commune pour login ET register
interface AuthResponse {
    token: string;
    user: AuthUser & {
        // on laisse la possibilité d'avoir prénom/nom en plus
        firstName?: string;
        lastName?: string;
    };
}

// 🔹 LOGIN
export async function loginRequest(email: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', {
        email,
        password,
    });

    return response.data;
}

// 🔹 REGISTER
export async function registerRequest(data: {
    email: string;
    password: string;
    confirmPassword: string;
    firstName?: string;
    lastName?: string;
}): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
}
