// FRONTEND
// ─────────────────────────────────────────────────────────
// Navbar du site client
// - Affiche le nom de l'utilisateur connecté
// - Gère la redirection selon le rôle
// - Ouvre le AuthPrompt si non connecté
// - Déconnexion → retour à la landing (/)
// ─────────────────────────────────────────────────────────

import React, { useState } from 'react';
import '../../styles/components/_navbar.scss';
import Button from '../ui/Button';
import AuthPrompt from '../ui/AuthPrompt';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
    const [showPrompt, setShowPrompt] = useState(false);

    // user = null → pas connecté
    // logout() → vide le contexte + localStorage
    const { user, logout } = useAuth();

    const navigate = useNavigate();

    // Gestion du bouton "Prendre RDV / Connexion"
    const handleBookClick = () => {
        if (!user) {
            //  Pas connecté → on ouvre la popup (connexion / inscription)
            setShowPrompt(true);
        } else if (user.role === 'owner') {
            // Propriétaire → dashboard owner
            navigate('/owner');
        } else {
            // Client → dashboard client
            navigate('/client');
        }
    };

    // Gestion de la déconnexion
    const handleLogout = () => {
        // On sort d'abord de la page protégée (/client ou /owner)
        navigate('/');

        // Puis on nettoie l'auth dans le "tick" suivant
        setTimeout(() => {
            logout();
        }, 0);
    };



    return (
        <>
            <header className="navbar">
                <div className="navbar__inner">

                    {/* Logo */}
                    <div className="navbar__brand">
                        <span className="navbar__title">SoftHair Studio</span>
                    </div>

                    {/* Liens */}
                    <nav className="navbar__nav">
                        <a href="#services" className="navbar__link">Services</a>
                        <a href="#coiffeurs" className="navbar__link">Coiffeurs</a>
                        <a href="#contact" className="navbar__link">Contact</a>
                        <a href="#localisation" className="navbar__link">Localisation</a>
                    </nav>

                    {/* Zone droite : utilisateur / bouton */}
                    <div className="navbar__cta">
                        {user ? (
                            <>
                                {/*  Affichage du NOM */}
                                <span className="navbar__user-name">
                                    Bonjour,&nbsp;
                                    <strong>
                                        {user.firstName || user.lastName || user.email}
                                    </strong>
                                </span>

                                <Button
                                    variant="secondary"
                                    onClick={handleLogout}
                                >
                                    Déconnexion
                                </Button>
                            </>
                        ) : (
                            <Button variant="secondary" onClick={handleBookClick}>
                                Prendre un rendez-vous
                            </Button>
                        )}
                    </div>

                </div>
            </header>

            {/* Popup connexion / inscription */}
            {showPrompt && (
                <AuthPrompt onClose={() => setShowPrompt(false)} />
            )}
        </>
    );
};

export default Navbar;
