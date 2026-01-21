import React, { useEffect, useMemo, useState } from "react";
import OwnerSidebar from "../../components/layout/OwnerSidebar"; // adapte si ton path diffère
import { apiClient } from "../../services/apiClient"; // adapte si ton path diffère
import "../../styles/pages/_ownerClients.scss";

type OwnerClientRow = {
    _id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    totalAppointments: number;   // nb rdv
    cancelledAppointments: number; // nb annulés
    rescheduledAppointments: number; // nb reportés
};

const OwnerClientsPage: React.FC = () => {
    const [items, setItems] = useState<OwnerClientRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [q, setQ] = useState("");

    const refresh = async () => {
        try {
            setLoading(true);
            setError(null);

            const res = await apiClient.get<OwnerClientRow[]>("/owner/clients");
            setItems(res.data);
        } catch (e: any) {
            setError(e?.response?.data?.message || "Impossible de charger les clients.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refresh();
    }, []);

    const filtered = useMemo(() => {
        const query = q.trim().toLowerCase();
        if (!query) return items;

        return items.filter((c) => {
            const fullName = `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim().toLowerCase();
            return (
                fullName.includes(query) ||
                (c.email ?? "").toLowerCase().includes(query)
            );
        });
    }, [items, q]);

    return (
        <div className="owner-layout">
            <OwnerSidebar />

            <main className="owner-main">
                <header className="owner-clients__header">
                    <div>
                        <h1>Clients</h1>
                        <p>Liste des clients et statistiques de rendez-vous.</p>
                    </div>

                    <input
                        className="owner-clients__search"
                        placeholder="Rechercher (nom, email)…"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                    />
                </header>

                {loading && <p>Chargement…</p>}
                {error && <p className="owner-clients__error">{error}</p>}

                {!loading && !error && (
                    <section className="owner-clients__card">
                        {filtered.length === 0 ? (
                            <p className="owner-clients__empty">Aucun client.</p>
                        ) : (
                            <div className="owner-clients__tableWrap">
                                <table className="owner-clients__table">
                                    <thead>
                                    <tr>
                                        <th>Client</th>
                                        <th className="num">RDV</th>
                                        <th className="num">Annulés</th>
                                        <th className="num">Reportés</th>
                                    </tr>
                                    </thead>

                                    <tbody>
                                    {filtered.map((c) => {
                                        const name = `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim() || "Client";
                                        return (
                                            <tr key={c._id}>
                                                <td>
                                                    <div className="owner-clients__identity">
                                                        <div className="owner-clients__avatar">
                                                            {(c.firstName?.[0] || "C").toUpperCase()}
                                                        </div>
                                                        <div className="owner-clients__idText">
                                                            <div className="owner-clients__name">
                                                                {name} <span className="owner-clients__email">({c.email})</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="num">{c.totalAppointments}</td>
                                                <td className="num">{c.cancelledAppointments}</td>
                                                <td className="num">{c.rescheduledAppointments}</td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                )}
            </main>
        </div>
    );
};

export default OwnerClientsPage;
