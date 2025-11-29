// FRONTEND
// Contexte d'authentification pour le front.
// Il stocke :
// - le user (id, email, role)
// - le token JWT
// - les fonctions login/logout

import React, { createContext, useContext, useState, useEffect } from 'react';
// ⬇️ Import par défaut conseillé avec jwt-decode
import {jwtDecode} from 'jwt-decode';

// Type de rôle possible
export type UserRole = 'client' | 'owner';

// Format du token décodé
interface DecodedToken {
    sub: string;
    role: UserRole;
    exp: number;
    iat: number;
}

// ✅ On exporte bien AuthUser en "named export"
export interface AuthUser {
    id: string;
    email: string;
    role: UserRole;
}

// Format des données exposées par le contexte
interface AuthContextValue {
    user: AuthUser | null;
    token: string | null;
    login: (token: string, user: AuthUser) => void;
    logout: () => void;
}

// Création du contexte (nullable au départ)
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Provider global qui entoure toute l'app
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(null);

    // Au chargement, on regarde s'il y a un token dans le localStorage
    useEffect(() => {
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('auth_user');

        if (storedToken && storedUser) {
            try {
                const decoded = jwtDecode<DecodedToken>(storedToken);

                // Si le token est expiré, on nettoie
                if (decoded.exp * 1000 < Date.now()) {
                    localStorage.removeItem('auth_token');
                    localStorage.removeItem('auth_user');
                    return;
                }

                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            } catch (e) {
                // Token invalide → on nettoie
                localStorage.removeItem('auth_token');
                localStorage.removeItem('auth_user');
            }
        }
    }, []);

    // Fonction appelée après un login ou un register réussi
    const login = (jwt: string, userData: AuthUser) => {
        setToken(jwt);
        setUser(userData);
        localStorage.setItem('auth_token', jwt);
        localStorage.setItem('auth_user', JSON.stringify(userData));
    };

    // Déconnexion
    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook pour consommer facilement le contexte
export const useAuth = (): AuthContextValue => {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth doit être utilisé dans un AuthProvider');
    }
    return ctx;
};
