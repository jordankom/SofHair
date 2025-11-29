// AuthLayout.tsx
// Layout générique pour les pages "publiques" :
// - Affiche la navbar en haut
// - Affiche le contenu (children) en dessous
// Le hero, l'image de fond, etc. sont gérés directement dans la page.

import React from 'react';
import Navbar from './Navbar';
import '../../styles/pages/_auth.scss';

interface AuthLayoutProps {
    children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
    return (
        <div className="auth-layout">
            {/* Navbar : toujours visible en haut */}
            <Navbar />

            {/* Contenu de la page (hero + sections, etc.) */}
            <main className="auth-layout__main">
                {children}
            </main>
        </div>
    );
};

export default AuthLayout;
