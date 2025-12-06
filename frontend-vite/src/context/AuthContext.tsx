// FRONTEND
// Contexte d'authentification pour le front.
// Il stocke :
// - le user (id, email, role)
// - le token JWT
// - les fonctions login/logout

import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

// Type de rôle possible
export type UserRole = 'client' | 'owner';

// Format du token décodé
interface DecodedToken {
    sub: string;
    role: UserRole;
    exp: number;
    iat: number;
}

// Utilisateur authentifié
export interface AuthUser {
    id: string;
    email: string;
    role: UserRole;
    firstName?: string;
    lastName?: string;
}

// Données exposées par le contexte
interface AuthContextValue {
    user: AuthUser | null;
    token: string | null;
    login: (token: string, user: AuthUser) => void;
    logout: () => void;
}

// Création du contexte
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(null);

    // Au chargement, on regarde s'il y a un token dans le sessionStorage
    useEffect(() => {
        const storedToken = sessionStorage.getItem('auth_token');
        const storedUser = sessionStorage.getItem('auth_user');

        if (storedToken && storedUser) {
            try {
                const decoded = jwtDecode<DecodedToken>(storedToken);

                // Si le token est expiré, on nettoie
                if (decoded.exp * 1000 < Date.now()) {
                    sessionStorage.removeItem('auth_token');
                    sessionStorage.removeItem('auth_user');
                    return;
                }

                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            } catch (e) {
                // Token invalide → on nettoie
                sessionStorage.removeItem('auth_token');
                sessionStorage.removeItem('auth_user');
            }
        }
    }, []);

    // Appelé après un login / register réussi
    const login = (jwt: string, userData: AuthUser) => {
        setToken(jwt);
        setUser(userData);
        sessionStorage.setItem('auth_token', jwt);
        sessionStorage.setItem('auth_user', JSON.stringify(userData));
    };

    // Déconnexion
    const logout = () => {
        setToken(null);
        setUser(null);
        sessionStorage.removeItem('auth_token');
        sessionStorage.removeItem('auth_user');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook pour consommer le contexte
export const useAuth = (): AuthContextValue => {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth doit être utilisé dans un AuthProvider');
    }
    return ctx;
};
