// Barre latérale (menu) pour l'espace propriétaire

import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    FiGrid,
    FiCalendar,
    FiUsers,
    FiShoppingBag,
    FiBarChart2,
    FiGift,
    FiMail,
    FiLogOut,
    FiSettings,
} from 'react-icons/fi';

import '../../styles/components/_ownerSidebar.scss';

// Type pour décrire un item de menu
interface SidebarItem {
    label: string;
    icon: React.ReactNode;
    to: string;
    section?: 'main' | 'bottom';
}

// Liste des items du menu
const sidebarItems: SidebarItem[] = [
    // Section principale
    { label: 'Dashboard',       icon: <FiGrid />,        to: '/owner' },
    { label: 'Calendrier',      icon: <FiCalendar />,    to: '/owner/calendar' },
    { label: 'Clients',         icon: <FiUsers />,       to: '/owner/clients' },
    { label: 'Commandes',       icon: <FiShoppingBag />, to: '/owner/orders' },
    { label: 'Ventes',          icon: <FiBarChart2 />,   to: '/owner/sales' },
    { label: 'Promotions',      icon: <FiGift />,        to: '/owner/promotions' },
    { label: 'E-mails',         icon: <FiMail />,        to: '/owner/emails' },

    // Section bas (logout, paramètres)
    { label: 'Paramètres',      icon: <FiSettings />,    to: '/owner/settings', section: 'bottom' },
    { label: 'Déconnexion',     icon: <FiLogOut />,      to: '/logout',         section: 'bottom' },
];

const OwnerSidebar: React.FC = () => {
    // On sépare les items "haut" et "bas" pour imiter le design
    const mainItems = sidebarItems.filter(item => item.section !== 'bottom');
    const bottomItems = sidebarItems.filter(item => item.section === 'bottom');

    return (
        <aside className="owner-sidebar">
            {/* Logo / nom du salon */}
            <div className="owner-sidebar__header">
                <div className="owner-sidebar__logo-dot" />
                <div className="owner-sidebar__brand">
                    <span className="owner-sidebar__brand-title">SoftHair</span>
                    <span className="owner-sidebar__brand-subtitle">Salon Manager</span>
                </div>
            </div>

            {/* Menu principal */}
            <nav className="owner-sidebar__nav owner-sidebar__nav--main">
                {mainItems.map(item => (
                    <NavLink
                        key={item.label}
                        to={item.to}
                        className={({ isActive }) =>
                            `owner-sidebar__item ${isActive ? 'owner-sidebar__item--active' : ''}`
                        }
                    >
                        <span className="owner-sidebar__icon">{item.icon}</span>
                        <span className="owner-sidebar__label">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Menu bas (paramètres, logout) */}
            <nav className="owner-sidebar__nav owner-sidebar__nav--bottom">
                {bottomItems.map(item => (
                    <NavLink
                        key={item.label}
                        to={item.to}
                        className={({ isActive }) =>
                            `owner-sidebar__item ${isActive ? 'owner-sidebar__item--active' : ''}`
                        }
                    >
                        <span className="owner-sidebar__icon">{item.icon}</span>
                        <span className="owner-sidebar__label">{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
};

export default OwnerSidebar;
