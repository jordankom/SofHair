// FRONTEND
// Barre latérale (menu) pour l’espace propriétaire SoftHair
// Version finale validée selon le backlog métier du salon

import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import {
    FiGrid,
    FiCalendar,
    FiUsers,
    FiUserCheck,
    FiScissors,
    FiGift,
    FiBarChart2,
    FiSettings,
    FiLogOut,
} from 'react-icons/fi';

import '../../styles/components/_ownerSidebar.scss';

// Type pour décrire un item du menu
interface SidebarItem {
    label: string;
    icon: React.ReactNode;
    to?: string;          // certaines entrées n’ont pas de route (ex: logout)
    section?: 'main' | 'bottom';
    action?: () => void; // pour le bouton Déconnexion
}

// Composant principal
const OwnerSidebar: React.FC = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    // Fonction de déconnexion propre
    const handleLogout = () => {
        logout();          // suppression du token + user
        navigate('/');    // retour vers la landing page
    };

    // MENU
    const sidebarItems: SidebarItem[] = [
        // SECTION PRINCIPALE
        { label: 'Dashboard',    icon: <FiGrid />,       to: '/owner' },
        { label: 'Rendez-vous', icon: <FiCalendar />,   to: '/owner/appointments' },
        { label: 'Clients',      icon: <FiUsers />,      to: '/owner/clients' },
        { label: 'Équipe',       icon: <FiUserCheck />,  to: '/owner/team' },
        { label: 'Prestations', icon: <FiScissors />,   to: '/owner/prestations' },
        { label: 'Promotions',  icon: <FiGift />,       to: '/owner/promotions' },
        { label: 'Statistiques',icon: <FiBarChart2 />,  to: '/owner/stats' },

        // SECTION BASSE
        { label: 'Paramètres',  icon: <FiSettings />,   to: '/owner/settings', section: 'bottom' },
        { label: 'Déconnexion',icon: <FiLogOut />,      section: 'bottom', action: handleLogout },
    ];

    // Séparation haut / bas
    const mainItems = sidebarItems.filter(item => item.section !== 'bottom');
    const bottomItems = sidebarItems.filter(item => item.section === 'bottom');

    return (
        <aside className="owner-sidebar">

            {/* LOGO / TITRE */}
            <div className="owner-sidebar__header">
                <div className="owner-sidebar__logo-dot" />
                <div className="owner-sidebar__brand">
                    <span className="owner-sidebar__brand-title">SoftHair</span>
                    <span className="owner-sidebar__brand-subtitle">Salon Manager</span>
                </div>
            </div>

            {/* MENU PRINCIPAL */}
            <nav className="owner-sidebar__nav owner-sidebar__nav--main">
                {mainItems.map(item => (
                    <NavLink
                        key={item.label}
                        to={item.to!}
                        className={({ isActive }) =>
                            `owner-sidebar__item ${isActive ? 'owner-sidebar__item--active' : ''}`
                        }
                    >
                        <span className="owner-sidebar__icon">{item.icon}</span>
                        <span className="owner-sidebar__label">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* MENU BAS */}
            <nav className="owner-sidebar__nav owner-sidebar__nav--bottom">
                {bottomItems.map(item => (
                    item.action ? (
                        <button
                            key={item.label}
                            onClick={item.action}
                            className="owner-sidebar__item owner-sidebar__logout"
                        >
                            <span className="owner-sidebar__icon">{item.icon}</span>
                            <span className="owner-sidebar__label">{item.label}</span>
                        </button>
                    ) : (
                        <NavLink
                            key={item.label}
                            to={item.to!}
                            className={({ isActive }) =>
                                `owner-sidebar__item ${isActive ? 'owner-sidebar__item--active' : ''}`
                            }
                        >
                            <span className="owner-sidebar__icon">{item.icon}</span>
                            <span className="owner-sidebar__label">{item.label}</span>
                        </NavLink>
                    )
                ))}
            </nav>

        </aside>
    );
};

export default OwnerSidebar;
