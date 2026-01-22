// frontend/src/pages/Owner/OwnerStatsPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import OwnerSidebar from "../../components/layout/OwnerSidebar";
import "../../styles/pages/_ownerStats.scss";
import { getOwnerStats, type OwnerStatsResponse } from "../../services/owner.service";

const OwnerStatsPage: React.FC = () => {
    // Par défaut : mois en cours
    const [from, setFrom] = useState(() => dayjs().startOf("month").format("YYYY-MM-DD"));
    const [to, setTo] = useState(() => dayjs().endOf("month").format("YYYY-MM-DD"));

    const [data, setData] = useState<OwnerStatsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const refresh = async (range?: { from: string; to: string }) => {
        try {
            setLoading(true);
            setError(null);
            const res = await getOwnerStats(range ?? { from, to });
            setData(res);
        } catch (e: any) {
            setError(e?.response?.data?.message || "Impossible de charger les statistiques.");
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refresh();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Chart: transforme rdvPerDay en format affichable
    const chartBars = useMemo(() => {
        const items = data?.rdvPerDay ?? [];
        // ✅ CHANGED: force count en number (au cas où l’API renvoie string / null)
        return items.map((x: any) => ({
            label: dayjs(x.date).format("DD/MM"),
            value: Number(x.count ?? 0),
        }));
    }, [data]);

    // Pour calculer la hauteur max (pour un rendu joli)
    const maxValue = useMemo(() => {
        // ✅ CHANGED: blindage (toujours >= 1)
        const vals = chartBars.map((b) => Number(b.value ?? 0));
        return vals.length ? Math.max(...vals, 1) : 1;
    }, [chartBars]);

    // KPI formatés
    const revenueLabel = useMemo(() => {
        const v = data?.kpis.revenue ?? 0;
        return `${Number(v).toFixed(0)} €`; // ✅ CHANGED: ensure number
    }, [data]);

    return (
        <div className="owner-layout">
            <OwnerSidebar />

            <main className="owner-layout__main owner-stats">
                {/* HEADER */}
                <header className="owner-stats__header">
                    <div>
                        <h1>Statistiques du salon</h1>
                        <p>Suivez les performances : rendez-vous, revenus, activité.</p>
                    </div>

                    {/* Filtres période */}
                    <div className="owner-stats__filters">
                        <div className="owner-stats__filter">
                            <label>Du</label>
                            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
                        </div>

                        <div className="owner-stats__filter">
                            <label>Au</label>
                            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
                        </div>

                        <button
                            className="owner-stats__apply"
                            onClick={() => refresh({ from, to })}
                            disabled={loading}
                            title="Rafraîchir les statistiques"
                        >
                            {loading ? "Chargement…" : "Appliquer"}
                        </button>
                    </div>
                </header>

                {error && <p className="owner-stats__error">{error}</p>}
                {loading && <p>Chargement…</p>}

                {!loading && !error && data && (
                    <>
                        {/* KPI */}
                        <section className="owner-stats__kpis">
                            <article className="owner-stats__kpi-card">
                                <p className="owner-stats__kpi-label">Chiffre d’affaires (période)</p>
                                <p className="owner-stats__kpi-value">{revenueLabel}</p>
                                <span className="owner-stats__kpi-badge owner-stats__kpi-badge--up">
                  Prestations réservées et payées
                </span>
                            </article>

                            <article className="owner-stats__kpi-card">
                                <p className="owner-stats__kpi-label">Rendez-vous (booked)</p>
                                <p className="owner-stats__kpi-value">{data.kpis.totalAppointments}</p>
                                <span className="owner-stats__kpi-badge">sur la période</span>
                            </article>

                            <article className="owner-stats__kpi-card">
                                <p className="owner-stats__kpi-label">Reports (total)</p>
                                <p className="owner-stats__kpi-value">{data.kpis.totalReschedules}</p>
                                <span className="owner-stats__kpi-badge">Rendez-vous annulés</span>
                            </article>

                            <article className="owner-stats__kpi-card">
                                <p className="owner-stats__kpi-label">Top prestation</p>
                                <p className="owner-stats__kpi-value">{data.topServices[0]?.name ?? "—"}</p>
                                <span className="owner-stats__kpi-badge">
                  {data.topServices[0] ? `${data.topServices[0].count} RDV` : "Aucune donnée"}
                </span>
                            </article>
                        </section>

                        {/* GRID */}
                        <section className="owner-stats__grid">
                            {/* Chart */}
                            <article className="owner-stats__card owner-stats__card--chart">
                                <div className="owner-stats__card-header">
                                    <h2>Rendez-vous par jour</h2>
                                    <p>
                                        Période : {data.range.from} → {data.range.to}
                                    </p>
                                </div>

                                <div className="owner-stats__chart">
                                    {chartBars.length === 0 ? (
                                        <p style={{ color: "#64748b" }}>Aucune donnée sur cette période.</p>
                                    ) : (
                                        chartBars.map((b) => {
                                            // ✅ CHANGED: clamp + blindage pour éviter NaN/Infinity
                                            const safeValue = Number.isFinite(b.value) ? b.value : 0;
                                            const heightPct =
                                                maxValue > 0 ? Math.round((safeValue / maxValue) * 100) : 0;

                                            return (
                                                <div key={b.label} className="owner-stats__chart-bar">
                                                    <div
                                                        className="owner-stats__chart-bar-fill"
                                                        style={{ height: `${Math.max(0, Math.min(100, heightPct))}%` }} // ✅ CHANGED
                                                        title={`${safeValue} RDV`}
                                                    />
                                                    <span className="owner-stats__chart-bar-label">{b.label}</span>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </article>

                            {/* Right card: top lists */}
                            <article className="owner-stats__card owner-stats__card--todo">
                                <div className="owner-stats__card-header">
                                    <h2>Top (période)</h2>
                                    <p>Prestations & coiffeurs les plus sollicités.</p>
                                </div>

                                <div className="owner-stats__tops">
                                    <div className="owner-stats__topBlock">
                                        <h3>Prestations</h3>
                                        <ul>
                                            {data.topServices.length === 0 ? (
                                                <li className="muted">—</li>
                                            ) : (
                                                data.topServices.map((s) => (
                                                    <li key={s.serviceId}>
                                                        <span>{s.name}</span>
                                                        <span className="muted">
                              {s.count} rdv • {Number(s.revenue ?? 0).toFixed(0)}€ {/* ✅ CHANGED */}
                            </span>
                                                    </li>
                                                ))
                                            )}
                                        </ul>
                                    </div>

                                    <div className="owner-stats__topBlock">
                                        <h3>Coiffeurs</h3>
                                        <ul>
                                            {data.topStaff.length === 0 ? (
                                                <li className="muted">—</li>
                                            ) : (
                                                data.topStaff.map((s) => (
                                                    <li key={s.staffId}>
                            <span>
                              {s.firstName} {s.lastName}
                            </span>
                                                        <span className="muted">{s.count} rdv</span>
                                                    </li>
                                                ))
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </article>
                        </section>
                    </>
                )}
            </main>
        </div>
    );
};

export default OwnerStatsPage;
