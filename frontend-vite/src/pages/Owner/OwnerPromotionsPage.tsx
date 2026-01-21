// FRONTEND - src/pages/Owner/OwnerPromotionsPage.tsx
// Owner Promotions : liste + activer/désactiver + supprimer + créer

import React, { useEffect, useMemo, useState } from "react";
import OwnerSidebar from "../../components/layout/OwnerSidebar";
import Button from "../../components/ui/Button";
import OwnerPromotionFormModal from "../../components/ui/OwnerPromotionFormModal";
import "../../styles/pages/_ownerPromotions.scss";

import {
    ownerCreatePromotion,
    ownerDeletePromotion,
    ownerListPromotions,
    ownerTogglePromotion,
    type Promotion,
} from "../../services/promotionsApi";

function formatTarget(p: Promotion) {
    if (p.targetType === "all") return "Tout le salon";
    if (p.targetType === "category") return `Catégorie: ${p.targetCategory ?? "?"}`;
    return `Prestation: ${p.targetServiceId ?? "?"}`;
}

function formatValue(p: Promotion) {
    return p.type === "percent" ? `-${p.value}%` : `-${p.value}€`;
}

const OwnerPromotionsPage: React.FC = () => {
    const [items, setItems] = useState<Promotion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [openCreate, setOpenCreate] = useState(false);

    const refresh = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await ownerListPromotions();
            setItems(data);
        } catch (e: any) {
            setError(e?.response?.data?.message || "Impossible de charger les promotions.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refresh();
    }, []);

    const activeCount = useMemo(() => items.filter((p) => p.isActive).length, [items]);

    const handleCreate = async (payload: any) => {
        await ownerCreatePromotion(payload);
        await refresh();
    };

    const handleToggle = async (p: Promotion) => {
        await ownerTogglePromotion(p._id, !p.isActive);
        await refresh();
    };

    const handleDelete = async (p: Promotion) => {
        const ok = window.confirm(`Supprimer la promotion "${p.name}" ?`);
        if (!ok) return;

        await ownerDeletePromotion(p._id);
        await refresh();
    };

    return (
        <div className="owner-layout">
            <OwnerSidebar />

            <main className="owner-layout__main owner-promos">
                <header className="owner-layout__header owner-promos__header">
                    <div>
                        <h1>Promotions</h1>
                        <p>{activeCount} active(s) • Crée des promos appliquées automatiquement.</p>
                    </div>

                    <Button variant="primary" onClick={() => setOpenCreate(true)}>
                        + Créer une promo
                    </Button>
                </header>

                <section className="owner-promos__content">
                    {loading && <p>Chargement…</p>}
                    {error && <p className="owner-promos__error">{error}</p>}

                    {!loading && !error && (
                        <div className="owner-promos__list">
                            {items.map((p) => (
                                <article key={p._id} className={`promoCard ${p.isActive ? "" : "promoCard--off"}`}>
                                    <div className="promoCard__main">
                                        <div className="promoCard__titleRow">
                                            <div className="promoCard__title">{p.name}</div>
                                            <span className={`badge ${p.isActive ? "badge--ok" : "badge--off"}`}>
                        {p.isActive ? "Active" : "Inactive"}
                      </span>
                                        </div>

                                        <div className="promoCard__meta">
                                            <span className="pill">{formatValue(p)}</span>
                                            <span className="pill pill--soft">{formatTarget(p)}</span>

                                            {(p.startAt || p.endAt) && (
                                                <span className="pill pill--soft">
                          {p.startAt ? `du ${new Date(p.startAt).toLocaleDateString()}` : "—"}
                                                    {" "}
                                                    {p.endAt ? `au ${new Date(p.endAt).toLocaleDateString()}` : ""}
                        </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="promoCard__actions">
                                        <button className="client-btn client-btn--soft" onClick={() => handleToggle(p)}>
                                            {p.isActive ? "Désactiver" : "Activer"}
                                        </button>

                                        <button className="client-btn client-btn--danger" onClick={() => handleDelete(p)}>
                                            Supprimer
                                        </button>
                                    </div>
                                </article>
                            ))}

                            {items.length === 0 && (
                                <div className="owner-promos__empty">
                                    Aucune promotion. Crée la première 👇
                                </div>
                            )}
                        </div>
                    )}
                </section>

                <OwnerPromotionFormModal
                    open={openCreate}
                    onClose={() => setOpenCreate(false)}
                    onSubmit={handleCreate}
                />
            </main>
        </div>
    );
};

export default OwnerPromotionsPage;
