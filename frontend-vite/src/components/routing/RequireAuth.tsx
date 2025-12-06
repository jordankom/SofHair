// FRONTEND
// Composant de protection de route.
// Si l'utilisateur n'est pas connecté → redirection vers /login
// Si un tableau allowedRoles est passé → on vérifie le rôle.

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.tsx';

interface RequireAuthProps {
    children: React.ReactNode;
    allowedRoles?: Array<'client' | 'owner'>;
}

const RequireAuth: React.FC<RequireAuthProps> = ({ children, allowedRoles }) => {
    const { user } = useAuth();
    const location = useLocation();

    // Pas connecté → on renvoie vers /login
    if (!user) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    // Si des rôles sont spécifiés, on vérifie que l'utilisateur est autorisé
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Par exemple, un client qui essaie d'aller sur une page owner
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default RequireAuth;
