// FRONTEND - pages/Owner/OwnerTeamPage.tsx
import React, { useEffect, useState } from "react";
import OwnerSidebar from "../../components/layout/OwnerSidebar";
import Button from "../../components/ui/Button";
import "../../styles/pages/_ownerTeam.scss";

import { getStaffList, createStaff, toggleStaff, type Staff } from "../../services/staffApi";
import OwnerTeamFormModal from "../../components/ui/OwnerTeamFormModal";
import { useNavigate } from "react-router-dom";

const OwnerTeamPage: React.FC = () => {
    const navigate = useNavigate();

    const [items, setItems] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [openCreate, setOpenCreate] = useState(false);
    const [togglingId, setTogglingId] = useState<string | null>(null);

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

    const handleCreate = async (payload: {
        firstName: string;
        lastName: string;
        email?: string;
        phone?: string;
        avatarUrl?: string;
    }) => {
        await createStaff(payload);
        await refresh();
        setOpenCreate(false);
    };

    const handleToggle = async (s: Staff) => {
        try {
            setTogglingId(s._id);
            await toggleStaff(s._id, !s.isActive);
            await refresh();
        } finally {
            setTogglingId(null);
        }
    };

    return (
        <div className="owner-layout">
            <OwnerSidebar />

            <main className="owner-layout__main">
                <header className="owner-layout__header owner-team__header">
                    <div>
                        <h1>Équipe</h1>
                        <p>Gérez vos coiffeurs (fiches internes) et leur planning.</p>
                    </div>

                    <Button variant="primary" onClick={() => setOpenCreate(true)}>
                        + Ajouter un coiffeur
                    </Button>
                </header>

                <section className="owner-team__content">
                    {loading && <p>Chargement…</p>}
                    {error && <p className="owner-team__error">{error}</p>}

                    {!loading && !error && (
                        <div className="owner-team__grid">
                            {items.map((s) => (
                                <article key={s._id} className="owner-teamCard">
                                    <div className="owner-teamCard__top">
                                        <div className="owner-teamCard__avatar">
                                            {s.avatarUrl ? (
                                                <img src={s.avatarUrl} alt={`${s.firstName} ${s.lastName}`} />
                                            ) : (
                                                <div className="owner-teamCard__avatarPlaceholder">
                                                    {s.firstName?.[0]?.toUpperCase()}
                                                    {s.lastName?.[0]?.toUpperCase()}
                                                </div>
                                            )}
                                        </div>

                                        <div className="owner-teamCard__info">
                                            <div className="owner-teamCard__name">
                                                {s.firstName} {s.lastName}
                                            </div>
                                            <div className="owner-teamCard__meta">
                                                {s.email ? <span>{s.email}</span> : <span className="muted">Email non renseigné</span>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="owner-teamCard__bottom">
                    <span className={`badge ${s.isActive ? "badge--ok" : "badge--off"}`}>
                      {s.isActive ? "Actif" : "Inactif"}
                    </span>

                                        <button
                                            className="linkBtn"
                                            onClick={() => navigate(`/owner/team/${s._id}/planning`)}
                                            title="Voir le planning"
                                        >
                                            Voir planning
                                        </button>

                                        <button
                                            className="linkBtn"
                                            onClick={() => handleToggle(s)}
                                            disabled={togglingId === s._id}
                                            title={s.isActive ? "Désactiver ce coiffeur" : "Réactiver ce coiffeur"}
                                            style={{ opacity: togglingId === s._id ? 0.6 : 1 }}
                                        >
                                            {togglingId === s._id ? "…" : s.isActive ? "Désactiver" : "Activer"}
                                        </button>
                                    </div>
                                </article>
                            ))}

                            {items.length === 0 && <div className="owner-team__empty">Aucun coiffeur pour le moment. Ajoute le premier 👇</div>}
                        </div>
                    )}
                </section>

                <OwnerTeamFormModal open={openCreate} onClose={() => setOpenCreate(false)} onSubmit={handleCreate} />
            </main>
        </div>
    );
};

export default OwnerTeamPage;
