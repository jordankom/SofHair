// FRONTEND
// ─────────────────────────────────────────────────────────
// Navbar du site client
// Ajout du popup AuthPrompt si l'utilisateur n'est pas connecté
// ─────────────────────────────────────────────────────────

import React, { useState } from 'react';
import '../../styles/components/_navbar.scss';
import Button from '../ui/Button';
import AuthPrompt from '../ui/AuthPrompt';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';


const Navbar: React.FC = () => {
    const [showPrompt, setShowPrompt] = useState(false);
    const { user } = useAuth();   // user = null → pas connecté
    const navigate = useNavigate();

    const handleBookClick = () => {
        if (!user) {
            // Si pas connecté → montrer la popup
            navigate('/client');
            //setShowPrompt(true);
        } else {
            // Plus tard : page de prise de RDV ou tableau de bord
            navigate('/client');
        }
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

                    {/* Bouton Prendre RDV */}
                    <div className="navbar__cta">
                        <Button variant="secondary" onClick={handleBookClick}>
                            Prendre RDV
                        </Button>
                    </div>
                </div>
            </header>

            {/* Popup connexion */}
            {showPrompt && (
                <AuthPrompt onClose={() => setShowPrompt(false)} />
            )}
        </>
    );
};

export default Navbar;
