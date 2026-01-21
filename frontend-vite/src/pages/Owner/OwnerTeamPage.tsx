// FRONTEND - pages/Owner/OwnerTeamPage.tsx
// Page Owner : équipe (liste coiffeurs + ajout)
// NOTE : planning détaillé on le fera dans une étape suivante (UI dédiée)

import React, { useEffect, useState } from "react";
import OwnerSidebar from "../../components/layout/OwnerSidebar";
import Button from "../../components/ui/Button";
import "../../styles/pages/_ownerTeam.scss";

import { getStaffList, createStaff, type Staff } from "../../services/staffApi";
import OwnerTeamFormModal from "../../components/ui/OwnerTeamFormModal";

const OwnerTeamPage: React.FC = () => {
    const [items, setItems] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Modal ajout
    const [openCreate, setOpenCreate] = useState(false);

    // Refresh liste
    const refresh = async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await getStaffList();
            setItems(data);
        } catch (e: any) {
            setError(e?.response?.data?.message || "Impossible de charger l'équipe.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refresh();
    }, []);

    // Création coiffeur
    const handleCreate = async (payload: { firstName: string; lastName: string; email?: string }) => {
        try {
            setError(null);
            await createStaff(payload);
            await refresh();
            setOpenCreate(false);
        } catch (e: any) {
            setError(e?.response?.data?.message || "Impossible de créer ce coiffeur.");
        }
    };

    return (
        <div className="owner-layout">
            <OwnerSidebar />

            <main className="owner-layout__main">
                <header className="owner-layout__header owner-team__header">
                    <div>
                        <h1>Équipe</h1>
                        <p>Gérez vos coiffeurs (fiches internes). Le planning arrive à l’étape suivante.</p>
                    </div>

                    <Button variant="primary" onClick={() => setOpenCreate(true)}>
                        + Ajouter un coiffeur
                    </Button>
                </header>

                <section className="owner-team__content">
                    {loading && <p>Chargement…</p>}
                    {error && <p className="owner-team__error">{error}</p>}

                    {!loading && (
                        <>
                            {items.length === 0 ? (
                                <div className="owner-team__empty">
                                    Aucun coiffeur pour le moment. Ajoute le premier 👇
                                </div>
                            ) : (
                                <div className="owner-team__grid">
                                    {items.map((s) => (
                                        <article key={s._id} className="owner-teamCard">
                                            <div className="owner-teamCard__top">
                                                <div className="owner-teamCard__avatar">
                                                    <div className="owner-teamCard__avatarPlaceholder">
                                                        {(s.firstName?.[0] ?? "?").toUpperCase()}
                                                        {(s.lastName?.[0] ?? "?").toUpperCase()}
                                                    </div>
                                                </div>

                                                <div className="owner-teamCard__info">
                                                    <div className="owner-teamCard__name">
                                                        {s.firstName} {s.lastName}
                                                    </div>

                                                    <div className="owner-teamCard__meta">
                                                        {s.email ? (
                                                            <span>{s.email}</span>
                                                        ) : (
                                                            <span className="muted">Email non renseigné</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="owner-teamCard__bottom">
                        <span className={`badge ${s.isActive ? "badge--ok" : "badge--off"}`}>
                          {s.isActive ? "Actif" : "Inactif"}
                        </span>

                                                {/* Plus tard : bouton "Planning" */}
                                                <button className="linkBtn" disabled title="Planning : étape suivante">
                                                    Voir planning
                                                </button>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </section>

                {/* Modal création */}
                <OwnerTeamFormModal
                    open={openCreate}
                    onClose={() => setOpenCreate(false)}
                    onSubmit={handleCreate}
                />
            </main>
        </div>
    );
};

export default OwnerTeamPage;
