// FRONTEND
// ─────────────────────────────────────────────────────────
// Navbar du site client
// - Si pas connecté : bouton "Connexion"
// - Si connecté : avatar + nom, clic => petit panneau utilisateur
// ─────────────────────────────────────────────────────────

import React, { useState, useRef, useEffect } from 'react';
import '../../styles/components/_navbar.scss';
import Button from '../ui/Button';
import AuthPrompt from '../ui/AuthPrompt';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar: React.FC = () => {
    // État pour le popup (non utilisé ici, mais on le garde si tu veux le réutiliser)
    const [showPrompt, setShowPrompt] = useState(false);

    // Contexte d'authentification (user + logout)
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // État pour le petit menu utilisateur (avatar)
    const [showUserMenu, setShowUserMenu] = useState(false);
    const userMenuRef = useRef<HTMLDivElement | null>(null);

    // Fermer le menu si on clique en dehors
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                userMenuRef.current &&
                !userMenuRef.current.contains(event.target as Node)
            ) {
                setShowUserMenu(false);
            }
        }

        if (showUserMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showUserMenu]);

    // Clique sur "Prendre RDV" (quand on n'est pas connecté)
    const handleBookClick = () => {
        if (!user) {
            navigate('/login');
        } else if (user.role === 'owner') {
            navigate('/owner');
        } else {
            navigate('/client');
        }
    };

    // Initiales pour l’avatar : ex. "JC"
    const initials = user
        ? `${(user.firstName?.[0] || user.email[0] || '').toUpperCase()}${
            user.lastName?.[0]?.toUpperCase() || ''
        }`
        : '';

    // Nom affiché à côté de l’avatar
    const displayName = user
        ? `${(user.firstName || '').toUpperCase()} ${(
            user.lastName || ''
        ).toUpperCase()}`
        : '';

    return (
        <>
            <header className="navbar">
                <div className="navbar__inner">
                    {/* Logo */}
                    <div className="navbar__brand">
                        <span className="navbar__title">SoftHair Studio</span>
                    </div>

                    {/* Liens d'ancrage */}
                    <nav className="navbar__nav">
                        <a href="#services" className="navbar__link">
                            Services
                        </a>
                        <a href="#coiffeurs" className="navbar__link">
                            Coiffeurs
                        </a>
                        <a href="#contact" className="navbar__link">
                            Contact
                        </a>
                        <a href="#localisation" className="navbar__link">
                            Localisation
                        </a>
                    </nav>

                    {/* Côté droit : bouton ou avatar/menu */}
                    <div className="navbar__cta">
                        {/* Si utilisateur connecté → avatar + menu */}
                        {user ? (
                            <div className="navbar__user" ref={userMenuRef}>
                                {/* Bouton avatar + nom */}
                                <button
                                    type="button"
                                    className="navbar__user-trigger"
                                    onClick={() => setShowUserMenu((prev) => !prev)}
                                >
                                    <div className="navbar__avatar">
                                        <span>{initials}</span>
                                    </div>
                                    <div className="navbar__user-info">
                                        <span className="navbar__user-name">{displayName}</span>
                                        <span className="navbar__user-sub">
                      {user.role === 'owner'
                          ? 'Espace propriétaire'
                          : 'Espace client'}
                    </span>
                                    </div>
                                </button>

                                {/* Panneau flottant */}
                                {showUserMenu && (
                                    <div className="navbar__user-menu">
                                        <p className="navbar__user-menu-title">
                                            Bonjour,{' '}
                                            <strong>
                                                {user.firstName || user.email.split('@')[0]}
                                            </strong>
                                        </p>

                                        {/* Bouton principal : remplace "Voir votre espace Flying Blue" */}
                                        <button
                                            type="button"
                                            className="navbar__user-menu-main-btn"
                                            onClick={() => {
                                                setShowUserMenu(false);
                                                if (user.role === 'owner') {
                                                    navigate('/owner');
                                                } else {
                                                    navigate('/client');
                                                }
                                            }}
                                        >
                                            Accéder à mon espace
                                        </button>

                                        {/* Bouton secondaire : profil (placeholder pour plus tard) */}
                                        <button
                                            type="button"
                                            className="navbar__user-menu-secondary-btn"
                                            onClick={() => {
                                                // À implémenter plus tard (page profil)
                                                setShowUserMenu(false);
                                            }}
                                        >
                                            Voir mon profil
                                        </button>

                                        {/* Bouton déconnexion */}
                                        <button
                                            type="button"
                                            className="navbar__user-menu-logout"
                                            onClick={() => {
                                                logout();
                                                setShowUserMenu(false);
                                                navigate('/'); // retour à la landing
                                            }}
                                        >
                                            <span className="navbar__logout-icon">⏻</span>
                                            <span>Se déconnecter</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            // Si pas connecté → bouton Connexion / Prendre RDV
                            <Button variant="secondary" onClick={handleBookClick}>
                                Connexion
                            </Button>
                        )}
                    </div>
                </div>
            </header>

            {/* Popup connexion si tu veux le réutiliser plus tard */}
            {showPrompt && <AuthPrompt onClose={() => setShowPrompt(false)} />}
        </>
    );
};

export default Navbar;
