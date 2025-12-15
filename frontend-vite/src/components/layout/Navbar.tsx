// FRONTEND
// Navbar client : si connecté -> menu avatar + dropdown
// sinon -> bouton Connexion

import React from "react";
import "../../styles/components/_navbar.scss";
import Button from "../ui/Button";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import ClientUserMenu from "./ClientUserMenu";

const Navbar: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleBookClick = () => {
        // Si pas connecté : on va au login
        if (!user) navigate("/login");
        else if (user.role === "owner") navigate("/owner");
        else navigate("/client");
    };

    return (
        <header className="navbar">
            <div className="navbar__inner">
                <div className="navbar__brand">
                    <span className="navbar__title">SoftHair Studio</span>
                </div>

                <nav className="navbar__nav">
                    <a href="#services" className="navbar__link">Services</a>
                    <a href="#coiffeurs" className="navbar__link">Coiffeurs</a>
                    <a href="#contact" className="navbar__link">Contact</a>
                    <a href="#localisation" className="navbar__link">Localisation</a>
                </nav>

                <div className="navbar__cta">
                    {user ? (
                        // ✅ Menu avatar (dropdown)
                        <ClientUserMenu />
                    ) : (
                        //  Bouton Connexion si non connecté
                        <Button variant="secondary" onClick={handleBookClick}>
                            Connexion
                        </Button>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
