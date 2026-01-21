import React, { useEffect, useMemo, useState } from "react";
import "../../styles/components/_ownerServiceModal.scss";
import type { CreateServicePayload, Service } from "../../services/servicesApi";

type Props = {
    open: boolean;
    onClose: () => void;

    //  si présent => mode EDIT
    initialService?: Service | null;


    onSubmit: (payload: CreateServicePayload) => Promise<void>;

};

const OwnerServiceFormModal: React.FC<Props> = ({ open, onClose, onSubmit, initialService }) => {
    const isEdit = !!initialService?._id;

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

    //  quand on ouvre / change de service => préremplir
    useEffect(() => {
        if (!open) return;

        if (initialService) {
            setName(initialService.name ?? "");
            setCategory(initialService.category ?? "");
            setPrice(typeof initialService.price === "number" ? initialService.price : 25);
            setDurationMinutes(
                typeof initialService.durationMinutes === "number" ? initialService.durationMinutes : 30
            );
            setDescription((initialService as any).description ?? "");
            setImageUrl(initialService.imageUrl ?? "");
            setError(null);
            return;
        }

        // mode création
        setName("");
        setCategory("");
        setPrice(25);
        setDurationMinutes(30);
        setDescription("");
        setImageUrl("");
        setError(null);
    }, [open, initialService?._id]);

    const title = useMemo(() => (isEdit ? "Modifier la prestation" : "Ajouter une prestation"), [isEdit]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!name.trim() || !category.trim()) {
            setError("Veuillez remplir au minimum le nom et la catégorie.");
            return;
        }

        try {
            setLoading(true);

            const payload: CreateServicePayload = {
                name: name.trim(),
                category: category.trim(),
                price,
                durationMinutes,
                description: description.trim() || undefined,
                imageUrl: imageUrl.trim() || undefined,
            };

            await onSubmit(payload);

            //  en edit : on ferme direct
            // en create : on ferme aussi (plus clean)
            onClose();
        } catch (e) {
            console.error(e);
            setError(isEdit ? "Erreur lors de la modification." : "Erreur lors de la création.");
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <div className="owner-modal__backdrop" onClick={onClose}>
            <div className="owner-modal" onClick={(e) => e.stopPropagation()}>
                <div className="owner-modal__header">
                    <h2>{title}</h2>
                    <button className="owner-modal__close" onClick={onClose} aria-label="Fermer">
                        ✕
                    </button>
                </div>

                <form className="owner-modal__form" onSubmit={handleSubmit}>
                    <label className="owner-modal__label">
                        Nom de la prestation
                        <input
                            className="owner-modal__input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: Coupe homme dégradé"
                        />
                    </label>

                    <label className="owner-modal__label">
                        Catégorie
                        <input
                            className="owner-modal__input"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            placeholder="Ex: Coupe / Coloration / Soin"
                        />
                    </label>

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

                    <label className="owner-modal__label">
                        Description
                        <textarea
                            className="owner-modal__textarea"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Décris la prestation (optionnel)"
                        />
                    </label>

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
                        <button
                            type="button"
                            className="owner-modal__btn owner-modal__btn--ghost"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Annuler
                        </button>

                        <button type="submit" className="owner-modal__btn owner-modal__btn--primary" disabled={loading}>
                            {loading ? (isEdit ? "Enregistrement..." : "Création...") : isEdit ? "Enregistrer" : "Créer"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OwnerServiceFormModal;
