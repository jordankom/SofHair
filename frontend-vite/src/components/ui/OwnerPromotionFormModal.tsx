// Modal: création promotion (owner)

import React, { useEffect, useState } from "react";
import "../../styles/components/_ownerPromotionModal.scss";

import type { CreatePromotionPayload, PromoTargetType, PromoType } from "../../services/promotionsApi";
import { getServiceCategories, getServices, type ServiceItem } from "../../services/services.service";

type Props = {
    open: boolean;
    onClose: () => void;
    onSubmit: (payload: CreatePromotionPayload) => Promise<void>;
};

const OwnerPromotionFormModal: React.FC<Props> = ({ open, onClose, onSubmit }) => {
    if (!open) return null;

    // Champs
    const [name, setName] = useState("");
    const [type, setType] = useState<PromoType>("percent");
    const [value, setValue] = useState<number>(10);

    const [targetType, setTargetType] = useState<PromoTargetType>("all");
    const [targetCategory, setTargetCategory] = useState<string>("");
    const [targetServiceId, setTargetServiceId] = useState<string>("");

    const [startAt, setStartAt] = useState<string>(""); // YYYY-MM-DD
    const [endAt, setEndAt] = useState<string>("");     // YYYY-MM-DD
    const [isActive, setIsActive] = useState<boolean>(true);

    // Data pour dropdown
    const [categories, setCategories] = useState<string[]>([]);
    const [services, setServices] = useState<ServiceItem[]>([]);

    // UX
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Chargements (catégories + services) au moment d’ouvrir
    useEffect(() => {
        if (!open) return;

        (async () => {
            try {
                const [cats, svcs] = await Promise.all([getServiceCategories(), getServices()]);
                setCategories(cats);
                setServices(svcs);
            } catch {
                setCategories([]);
                setServices([]);
            }
        })();
    }, [open]);

    // Quand targetType change, reset les champs inutiles
    useEffect(() => {
        if (targetType !== "category") setTargetCategory("");
        if (targetType !== "service") setTargetServiceId("");
    }, [targetType]);

    const reset = () => {
        setName("");
        setType("percent");
        setValue(10);
        setTargetType("all");
        setTargetCategory("");
        setTargetServiceId("");
        setStartAt("");
        setEndAt("");
        setIsActive(true);
        setError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // mini validations front (le backend revalide)
        if (!name.trim()) return setError("Nom requis.");
        if (value <= 0) return setError("Valeur doit être > 0.");

        if (targetType === "category" && !targetCategory) {
            return setError("Choisis une catégorie.");
        }
        if (targetType === "service" && !targetServiceId) {
            return setError("Choisis une prestation.");
        }
        if (startAt && endAt && new Date(endAt) < new Date(startAt)) {
            return setError("La date de fin doit être après la date de début.");
        }

        const payload: CreatePromotionPayload = {
            name: name.trim(),
            type,
            value,
            targetType,
            targetCategory: targetType === "category" ? targetCategory : undefined,
            targetServiceId: targetType === "service" ? targetServiceId : undefined,
            startAt: startAt || undefined,
            endAt: endAt || undefined,
            isActive,
        };

        try {
            setLoading(true);
            await onSubmit(payload);
            reset();
            onClose();
        } catch (e: any) {
            setError(e?.response?.data?.message || "Erreur création promotion.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="owner-modal__backdrop" onClick={onClose}>
            <div className="owner-modal" onClick={(e) => e.stopPropagation()}>
                <div className="owner-modal__header">
                    <h2>Créer une promotion</h2>
                    <button className="owner-modal__close" onClick={onClose} aria-label="Fermer">
                        ✕
                    </button>
                </div>

                <form className="owner-modal__form" onSubmit={handleSubmit}>
                    <label className="owner-modal__label">
                        Nom
                        <input
                            className="owner-modal__input"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ex: Promo Saint-Valentin"
                        />
                    </label>

                    <div className="owner-modal__row">
                        <label className="owner-modal__label">
                            Type
                            <select className="owner-modal__input" value={type} onChange={(e) => setType(e.target.value as PromoType)}>
                                <option value="percent">Pourcentage (%)</option>
                                <option value="amount">Montant (€)</option>
                            </select>
                        </label>

                        <label className="owner-modal__label">
                            Valeur
                            <input
                                className="owner-modal__input"
                                type="number"
                                min={1}
                                step={1}
                                value={value}
                                onChange={(e) => setValue(Number(e.target.value))}
                            />
                        </label>
                    </div>

                    <label className="owner-modal__label">
                        Cible
                        <select
                            className="owner-modal__input"
                            value={targetType}
                            onChange={(e) => setTargetType(e.target.value as PromoTargetType)}
                        >
                            <option value="all">Tout le salon</option>
                            <option value="category">Une catégorie</option>
                            <option value="service">Une prestation</option>
                        </select>
                    </label>

                    {targetType === "category" && (
                        <label className="owner-modal__label">
                            Catégorie
                            <select
                                className="owner-modal__input"
                                value={targetCategory}
                                onChange={(e) => setTargetCategory(e.target.value)}
                            >
                                <option value="">— Choisir —</option>
                                {categories.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                        </label>
                    )}

                    {targetType === "service" && (
                        <label className="owner-modal__label">
                            Prestation
                            <select
                                className="owner-modal__input"
                                value={targetServiceId}
                                onChange={(e) => setTargetServiceId(e.target.value)}
                            >
                                <option value="">— Choisir —</option>
                                {services.map((s) => (
                                    <option key={s._id} value={s._id}>
                                        {s.name} ({s.category})
                                    </option>
                                ))}
                            </select>
                        </label>
                    )}

                    <div className="owner-modal__row">
                        <label className="owner-modal__label">
                            Début (optionnel)
                            <input className="owner-modal__input" type="date" value={startAt} onChange={(e) => setStartAt(e.target.value)} />
                        </label>

                        <label className="owner-modal__label">
                            Fin (optionnel)
                            <input className="owner-modal__input" type="date" value={endAt} onChange={(e) => setEndAt(e.target.value)} />
                        </label>
                    </div>

                    <label className="owner-modal__label" style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                        Active
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

export default OwnerPromotionFormModal;
