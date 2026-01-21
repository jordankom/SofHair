// FRONTEND - components/ui/OwnerTeamFormModal.tsx
// Modal simple pour créer un coiffeur (fiche interne)

import React, { useState } from "react";
import "../../styles/components/_clientModals.scss"; // réutilise ton style modal (backdrop + box)
import "../../styles/pages/_ownerTeam.scss";

type Props = {
    open: boolean;
    onClose: () => void;
    onSubmit: (payload: { firstName: string; lastName: string; email?: string }) => Promise<void>;
};

const OwnerTeamFormModal: React.FC<Props> = ({ open, onClose, onSubmit }) => {
    if (!open) return null;

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!firstName.trim() || !lastName.trim()) {
            setError("Prénom et nom sont requis.");
            return;
        }

        try {
            setLoading(true);
            await onSubmit({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim() || undefined,
            });

            // reset après succès
            setFirstName("");
            setLastName("");
            setEmail("");
        } catch (e: any) {
            setError(e?.response?.data?.message || "Erreur lors de la création.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="client-modal__backdrop" onClick={onClose}>
            <div className="client-modal" onClick={(e) => e.stopPropagation()}>
                <div className="client-modal__header">
                    <h2>Ajouter un coiffeur</h2>
                    <button className="client-modal__close" onClick={onClose} aria-label="Fermer">
                        ✕
                    </button>
                </div>

                <form className="owner-teamModal__form" onSubmit={handleSubmit}>
                    <label className="owner-teamModal__label">
                        Prénom
                        <input
                            className="owner-teamModal__input"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            placeholder="Ex: Jordan"
                        />
                    </label>

                    <label className="owner-teamModal__label">
                        Nom
                        <input
                            className="owner-teamModal__input"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            placeholder="Ex: Kom"
                        />
                    </label>

                    <label className="owner-teamModal__label">
                        Email (optionnel)
                        <input
                            className="owner-teamModal__input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="ex: coiffeur@softhair.com"
                        />
                    </label>

                    {error && <p className="owner-team__error" style={{ marginTop: 10 }}>{error}</p>}

                    <div className="owner-teamModal__actions">
                        <button type="button" className="client-btn client-btn--ghost" onClick={onClose}>
                            Annuler
                        </button>

                        <button type="submit" className="client-btn client-btn--primary" disabled={loading}>
                            {loading ? "Création…" : "Créer"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OwnerTeamFormModal;
