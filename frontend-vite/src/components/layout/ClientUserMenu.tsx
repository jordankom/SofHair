// Menu utilisateur (avatar + dropdown) pour l'espace client.
// Objectif : remplacer le bouton "Déconnexion" par un avatar + nom,
// puis ouvrir un menu au clic (profil, rdv, paramètres, déconnexion).

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FiUser, FiCalendar, FiSettings, FiLogOut } from "react-icons/fi";

import "../../styles/components/_clientUserMenu.scss";

const ClientUserMenu: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // État pour ouvrir/fermer le menu
    const [open, setOpen] = useState(false);

    // Ref pour détecter les clics en dehors du menu (close automatique)
    const wrapperRef = useRef<HTMLDivElement | null>(null);

    // Sécurité : si pas de user, on n'affiche rien (c'est la Navbar qui gère normalement)
    if (!user) return null;

    // Nom affiché : priorité prénom/nom, sinon email
    const displayName =
        [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;

    // Initiales pour l’avatar (ex: "Jordan Owner" -> "JO")
    const initials = (() => {
        const first = (user.firstName || "").trim();
        const last = (user.lastName || "").trim();
        const a = first ? first[0].toUpperCase() : "";
        const b = last ? last[0].toUpperCase() : "";
        return (a + b) || user.email[0].toUpperCase();
    })();

    // Fermer le menu quand on clique hors du composant
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (!wrapperRef.current) return;
            if (!wrapperRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Déconnexion : on vide le contexte + on retourne à la landing
    const handleLogout = () => {
        logout();           // 🔒 supprime token + user (sessionStorage)
        setOpen(false);     // ferme le menu
        navigate("/");      //  retour landing
    };

    return (
        <div className="client-user-menu" ref={wrapperRef}>
            {/* Bouton déclencheur (avatar + nom) */}
            <button
                type="button"
                className="client-user-menu__trigger"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-label="Ouvrir le menu utilisateur"
            >
                <div className="client-user-menu__avatar">{initials}</div>

                <div className="client-user-menu__name">
                    {/* On affiche le nom (ou email si pas de nom) */}
                    <span className="client-user-menu__nameText">{displayName}</span>
                    {/* Petit texte secondaire (tu peux changer) */}
                    <span className="client-user-menu__hint">Mon compte</span>
                </div>

                {/* Petit chevron simple (CSS) */}
                <span className={`client-user-menu__chev ${open ? "is-open" : ""}`} />
            </button>

            {/* Dropdown */}
            {open && (
                <div className="client-user-menu__dropdown" role="menu">
                    {/* Remplace “Voir votre espace” par quelque chose d’utile */}
                    <button
                        type="button"
                        className="client-user-menu__item"
                        onClick={() => {
                            setOpen(false);
                            navigate("/client"); // accueil client
                        }}
                    >
                        <FiUser />
                        <span>Tableau de bord</span>
                    </button>

                    <button
                        type="button"
                        className="client-user-menu__item"
                        onClick={() => {
                            setOpen(false);
                            navigate("/client/rdv");
                        }}
                    >
                        <FiCalendar />
                        <span>Mes rendez-vous</span>
                    </button>

                    <button
                        type="button"
                        className="client-user-menu__item"
                        onClick={() => {
                            setOpen(false);
                            navigate("/client/settings");
                        }}
                    >
                        <FiSettings />
                        <span>Paramètres</span>
                    </button>

                    <div className="client-user-menu__sep" />

                    <button
                        type="button"
                        className="client-user-menu__item client-user-menu__item--danger"
                        onClick={handleLogout}
                    >
                        <FiLogOut />
                        <span>Déconnexion</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default ClientUserMenu;
