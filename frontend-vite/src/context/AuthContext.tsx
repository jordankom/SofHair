// AuthContext.tsx
// Contexte global pour gérer l'état d'authentification côté front.
// Pour l'instant :
// - on simule un "user" en mémoire
// - plus tard, on branchera ça sur l'API de login / JWT.

import React, { createContext, useContext, useState } from 'react';

type UserRole = 'client' | 'owner';

export interface AuthUser {
    id: string;
    email: string;
    role: UserRole;
}

interface AuthContextValue {
    user: AuthUser | null;
    login: (user: AuthUser) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // État local : utilisateur connecté ou non
    const [user, setUser] = useState<AuthUser | null>(null);

    // Fonction pour "connecter" un utilisateur (simulé pour l'instant)
    const login = (u: AuthUser) => {
        setUser(u);
        // Plus tard : enregistrer le token dans localStorage ici
    };

    // Fonction pour se déconnecter
    const logout = () => {
        setUser(null);
        // Plus tard : supprimer le token du localStorage
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook pratique pour utiliser le contexte
export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth doit être utilisé dans un AuthProvider');
    }
    return ctx;
};
