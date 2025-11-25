// Navbar.tsx
// Barre de navigation du site :
// - Affiche le nom du salon
// - Propose des liens vers les sections de la page (#services, #coiffeurs, etc.)
// - Contient un bouton "Prendre RDV" (CTA principal, à connecter plus tard)

import React from 'react';
import '../../styles/components/_navbar.scss';
import Button from '../ui/Button';

const Navbar: React.FC = () => {
    return (
        <header className="navbar">
            <div className="navbar__inner">
                {/* Logo / nom de marque du salon */}
                <div className="navbar__brand">
                    <span className="navbar__logo-dot" />
                    <span className="navbar__title">SoftHair Studio</span>
                </div>

                {/* Liens de navigation vers les sections de la page (scroll par ancres) */}
                <nav className="navbar__nav">
                    <a href="#services" className="navbar__link">Services</a>
                    <a href="#coiffeurs" className="navbar__link">Coiffeurs</a>
                    <a href="#galerie" className="navbar__link">Galerie</a>
                    <a href="#contact" className="navbar__link">Contact</a>
                    <a href="#localisation" className="navbar__link">Localisation</a>
                </nav>

                {/* Bouton principal (call to action) : à connecter plus tard à la partie réservation */}
                <div className="navbar__cta">
                    <Button variant="secondary">
                        Prendre RDV
                    </Button>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
