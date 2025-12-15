// FRONTEND
// Modal + formulaire pour créer une prestation côté owner

import React, { useState } from "react";
import "../../styles/components/_ownerServiceModal.scss";
import type { CreateServicePayload } from "../../services/servicesApi";

type Props = {
    open: boolean; // contrôle affichage
    onClose: () => void; // fermer modal
    onSubmit: (payload: CreateServicePayload) => Promise<void>; // création + refresh
};

const OwnerServiceFormModal: React.FC<Props> = ({ open, onClose, onSubmit }) => {
    // Si pas ouvert, on ne rend rien (évite de polluer le DOM)
    if (!open) return null;

    // Champs du formulaire
    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [price, setPrice] = useState<number>(25);
    const [durationMinutes, setDurationMinutes] = useState<number>(30);
    const [description, setDescription] = useState("");
    const [imageUrl, setImageUrl] = useState("");

    // UX
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // mini validation
        if (!name.trim() || !category.trim()) {
            setError("Veuillez remplir au minimum le nom et la catégorie.");
            return;
        }

        try {
            setLoading(true);

            await onSubmit({
                name: name.trim(),
                category: category.trim(),
                price,
                durationMinutes,
                description: description.trim() || undefined,
                imageUrl: imageUrl.trim() || undefined,
            });

            //  après création : reset champs
            setName("");
            setCategory("");
            setDescription("");
            setImageUrl("");
            setPrice(25);
            setDurationMinutes(30);

            //  fermer
            //onClose();
        } catch (e) {
            console.error(e);
            setError("Erreur lors de la création de la prestation.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="owner-modal__backdrop" onClick={onClose}>
            {/* stopPropagation : cliquer dans la boîte ne ferme pas */}
            <div className="owner-modal" onClick={(e) => e.stopPropagation()}>
                <div className="owner-modal__header">
                    <h2>Ajouter une prestation</h2>
                    <button className="owner-modal__close" onClick={onClose} aria-label="Fermer">
                        ✕
                    </button>
                </div>

                <form className="owner-modal__form" onSubmit={handleSubmit}>
                    {/* Nom */}
                    <label className="owner-modal__label">
                        Nom de la prestation
                        <input
                            className="owner-modal__input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: Coupe homme dégradé"
                        />
                    </label>

                    {/* Catégorie */}
                    <label className="owner-modal__label">
                        Catégorie
                        <input
                            className="owner-modal__input"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            placeholder="Ex: Coupe / Coloration / Soin"
                        />
                    </label>

                    {/* Prix + durée en ligne */}
                    <div className="owner-modal__row">
                        <label className="owner-modal__label">
                            Prix (€)
                            <input
                                className="owner-modal__input"
                                type="number"
                                min={0}
                                step={1}
                                value={price}
                                onChange={(e) => setPrice(Number(e.target.value))}
                            />
                        </label>

                        <label className="owner-modal__label">
                            Durée (minutes)
                            <input
                                className="owner-modal__input"
                                type="number"
                                min={5}
                                step={5}
                                value={durationMinutes}
                                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                            />
                        </label>
                    </div>

                    {/* Description */}
                    <label className="owner-modal__label">
                        Description
                        <textarea
                            className="owner-modal__textarea"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Décris la prestation (optionnel)"
                        />
                    </label>

                    {/* Image */}
                    <label className="owner-modal__label">
                        Image (URL)
                        <input
                            className="owner-modal__input"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="https://..."
                        />
                    </label>

                    {error && <p className="owner-modal__error">{error}</p>}

                    <div className="owner-modal__actions">
                        <button type="button" className="owner-modal__btn owner-modal__btn--ghost" onClick={onClose}>
                            Annuler
                        </button>

                        <button type="submit" className="owner-modal__btn owner-modal__btn--primary" disabled={loading}>
                            {loading ? "Création..." : "Créer"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OwnerServiceFormModal;
