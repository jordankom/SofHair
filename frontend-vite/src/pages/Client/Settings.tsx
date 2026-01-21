import React from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/ui/Card";
import { useAuth } from "../../context/AuthContext";
import "../../styles/pages/_clientSettings.scss";

/**
 * Page Paramètres client (full width)
 */
const ClientSettingsPage: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <div className="client-settings">
            {/* Header */}
            <div className="client-settings__header">
                <div>
                    <h1>Paramètres</h1>
                    <p>Gérez votre profil, votre sécurité et vos préférences.</p>
                </div>
            </div>

            {/*  remplace la grid par une seule zone full width */}
            <div className="client-settings__content">
                <Card className="client-settings__card client-settings__card--full">
                    <div className="client-settings__cardHeader">
                        <h2>Mon profil</h2>
                        <span className="client-pill client-pill--soft">Compte</span>
                    </div>

                    <div className="client-settings__rows">
                        <div className="client-settings__row">
                            <div className="client-settings__label">Email</div>
                            <div className="client-settings__value">{user?.email ?? "—"}</div>
                        </div>

                        <div className="client-settings__row">
                            <div className="client-settings__label">Prénom</div>
                            <div className="client-settings__value">{user?.firstName ?? "—"}</div>
                        </div>

                        <div className="client-settings__row">
                            <div className="client-settings__label">Nom</div>
                            <div className="client-settings__value">{user?.lastName ?? "—"}</div>
                        </div>

                        <div className="client-settings__row">
                            <div className="client-settings__label">Rôle</div>
                            <div className="client-settings__value">{user?.role ?? "—"}</div>
                        </div>
                    </div>

                    <div className="client-settings__actions">
                        <button
                            className="client-btn client-btn--ghost"
                            onClick={() => navigate("/client")}
                            title="Retour au tableau de bord"
                        >
                            Retour dashboard
                        </button>

                        <button
                            className="client-btn client-btn--danger"
                            onClick={handleLogout}
                            title="Se déconnecter"
                        >
                            Se déconnecter
                        </button>
                    </div>
                </Card>

                {/*  ton bloc sécurité reste prêt si tu veux le remettre,
                    mais là tu veux une page pleine donc on le laisse commenté */}
            </div>
        </div>
    );
};

export default ClientSettingsPage;
