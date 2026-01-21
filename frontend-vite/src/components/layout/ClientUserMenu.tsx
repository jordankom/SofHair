//  Ajout des liens "Prendre un rendez-vous", "Services", "Galerie"
//  Ajout des icônes FiScissors, FiImage

import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
    FiUser,
    FiCalendar,
    FiSettings,
    FiLogOut,
    FiScissors,
    FiImage,
    FiPlusCircle
} from "react-icons/fi";

import "../../styles/components/_clientUserMenu.scss";

const ClientUserMenu: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [open, setOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement | null>(null);

    if (!user) return null;

    const displayName =
        [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;

    const initials = (() => {
        const first = (user.firstName || "").trim();
        const last = (user.lastName || "").trim();
        const a = first ? first[0].toUpperCase() : "";
        const b = last ? last[0].toUpperCase() : "";
        return (a + b) || user.email[0].toUpperCase();
    })();

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

    const handleLogout = () => {
        logout();
        setOpen(false);
        navigate("/");
    };

    return (
        <div className="client-user-menu" ref={wrapperRef}>
            <button
                type="button"
                className="client-user-menu__trigger"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-label="Ouvrir le menu utilisateur"
            >
                <div className="client-user-menu__avatar">{initials}</div>

                <div className="client-user-menu__name">
                    <span className="client-user-menu__nameText">{displayName}</span>
                    <span className="client-user-menu__hint">Mon compte</span>
                </div>

                <span className={`client-user-menu__chev ${open ? "is-open" : ""}`} />
            </button>

            {open && (
                <div className="client-user-menu__dropdown" role="menu">
                    <button
                        type="button"
                        className="client-user-menu__item"
                        onClick={() => {
                            setOpen(false);
                            navigate("/client");
                        }}
                    >
                        <FiUser />
                        <span>Tableau de bord</span>
                    </button>

                    {/*  bouton dashboard "Prendre un rendez-vous" */}
                    <button
                        type="button"
                        className="client-user-menu__item"
                        onClick={() => {
                            setOpen(false);
                            navigate("/client/rdv/new");
                        }}
                    >
                        <FiPlusCircle />
                        <span>Prendre un rendez-vous</span>
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

                    {/*  bouton dashboard "Services disponibles" */}
                    <button
                        type="button"
                        className="client-user-menu__item"
                        onClick={() => {
                            setOpen(false);
                            navigate("/client/services");
                        }}
                    >
                        <FiScissors />
                        <span>Services disponibles</span>
                    </button>

                    {/*  bouton dashboard "Galerie" */}
                    <button
                        type="button"
                        className="client-user-menu__item"
                        onClick={() => {
                            setOpen(false);
                            navigate("/client/gallery");
                        }}
                    >
                        <FiImage />
                        <span>Galerie</span>
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
