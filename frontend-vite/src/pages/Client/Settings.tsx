import React from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/ui/Card";
import { useAuth } from "../../context/AuthContext";
import "../../styles/pages/_clientSettings.scss";

/**
 * Page Paramètres client (version pro)
 * - Affiche les infos basiques depuis AuthContext
 * - Permet de se déconnecter (nettoyage sessionStorage via AuthContext.logout)
 * - Prépare la place pour ajouter : profil, mot de passe, préférences, etc.
 */
const ClientSettingsPage: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    /**
     * Déconnexion :
     * - nettoie le contexte + sessionStorage
     * - redirige vers la landing
     */
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

            <div className="client-settings__grid">
                {/* ===================== */}
                {/* Profil */}
                {/* ===================== */}
                <Card className="client-settings__card">
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

                    {/* Actions */}
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

                {/* ===================== */}
                {/* Sécurité (placeholder) */}
                {/* ===================== */}
                <Card className="client-settings__card">
                    <div className="client-settings__cardHeader">
                        <h2>Sécurité</h2>
                        <span className="client-pill">Bientôt</span>
                    </div>

                    <p className="client-settings__hint">
                        Ici tu pourras bientôt modifier ton mot de passe et gérer la sécurité de ton compte.
                    </p>

                    <div className="client-settings__actions">
                        <button className="client-btn client-btn--primary" disabled title="À venir">
                            Changer le mot de passe
                        </button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ClientSettingsPage;
