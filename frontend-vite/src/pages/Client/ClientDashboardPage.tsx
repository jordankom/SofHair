//  Déconnexion via AuthContext (logout + sessionStorage) au lieu de localStorage
//  Ajout du hook useAuth

import React from "react";
import { CalendarDays, ClipboardList, Scissors, Image, Settings, LogOut } from "lucide-react"; //  (LogOut)
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import "../../styles/pages/_clientDashboard.scss";

const actions = [
    { label: "Prendre un rendez-vous", icon: <CalendarDays />, route: "/client/rdv/new", variant: "primary" },
    { label: "Mes rendez-vous", icon: <ClipboardList />, route: "/client/rdv", variant: "secondary" },
    { label: "Services disponibles", icon: <Scissors />, route: "/client/services", variant: "pink" },
    { label: "Galerie", icon: <Image />, route: "/client/gallery", variant: "gold" },
    { label: "Paramètres", icon: <Settings />, route: "/client/settings", variant: "neutral" },
];

const ClientDashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();        // vide token + user du context + sessionStorage
        navigate("/");
    };

    return (
        <div className="client-dashboard">
            <h1>Bonjour </h1>
            <p className="subtitle">Que souhaitez-vous faire aujourd’hui ?</p>

            <div className="client-dashboard__grid">
                {actions.map((action) => (
                    <button
                        key={action.label}
                        className={`dashboard-card dashboard-card--${action.variant}`}
                        onClick={() => navigate(action.route)}
                    >
                        <div className="icon">{action.icon}</div>
                        <span>{action.label}</span>
                    </button>
                ))}

                {/*  bouton Déconnexion gardé, mais logique correcte */}
                <button
                    className="dashboard-card dashboard-card--neutral"
                    onClick={handleLogout}
                    aria-label="Se déconnecter"
                >
                    <div className="icon">
                        <LogOut /> {/*  icône */}
                    </div>
                    <span>Déconnexion</span>
                </button>
            </div>
        </div>
    );
};

export default ClientDashboardPage;
