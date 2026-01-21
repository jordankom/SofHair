// FRONTEND - pages/Owner/OwnerStaffPlanningPage.tsx
// Planning simple d'un coiffeur sur une semaine (owner only)

import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { useParams, useNavigate } from "react-router-dom";
import OwnerSidebar from "../../components/layout/OwnerSidebar";
import "../../styles/pages/_ownerStaffPlanning.scss";

import { getStaffSchedule, type OwnerStaffAppointment } from "../../services/staffApi";

const OwnerStaffPlanningPage: React.FC = () => {
    const { id } = useParams(); // staffId
    const navigate = useNavigate();

    const [weekStart, setWeekStart] = useState(() => dayjs().startOf("week")); // selon locale, tu peux faire startOf("isoWeek")
    const [items, setItems] = useState<OwnerStaffAppointment[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const from = useMemo(() => weekStart.format("YYYY-MM-DD"), [weekStart]);
    const to = useMemo(() => weekStart.add(6, "day").format("YYYY-MM-DD"), [weekStart]);

    useEffect(() => {
        if (!id) return;

        (async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await getStaffSchedule(id, from, to);
                setItems(data);
            } catch (e: any) {
                setError(e?.response?.data?.message || "Impossible de charger le planning.");
                setItems([]);
            } finally {
                setLoading(false);
            }
        })();
    }, [id, from, to]);

    // group by day
    const byDay = useMemo(() => {
        const map = new Map<string, OwnerStaffAppointment[]>();
        for (let i = 0; i < 7; i++) {
            const d = weekStart.add(i, "day").format("YYYY-MM-DD");
            map.set(d, []);
        }
        items.forEach((a) => {
            const key = dayjs(a.startAt).format("YYYY-MM-DD");
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(a);
        });
        // tri par heure
        for (const [, arr] of map) {
            arr.sort((a, b) => dayjs(a.startAt).valueOf() - dayjs(b.startAt).valueOf());
        }
        return map;
    }, [items, weekStart]);

    return (
        <div className="owner-layout">
            <OwnerSidebar />

            <main className="owner-layout__main owner-staffPlanning">
                <header className="owner-staffPlanning__header">
                    <div>
                        <h1>Planning du coiffeur</h1>
                        <p>Semaine du {weekStart.format("DD/MM/YYYY")} au {weekStart.add(6, "day").format("DD/MM/YYYY")}</p>
                    </div>

                    <div className="owner-staffPlanning__actions">
                        <button className="owner-staffPlanning__btn" onClick={() => navigate("/owner/team")}>
                            ← Retour équipe
                        </button>

                        <button className="owner-staffPlanning__btn" onClick={() => setWeekStart((w) => w.subtract(7, "day"))}>
                            ← Semaine
                        </button>

                        <button className="owner-staffPlanning__btn" onClick={() => setWeekStart(dayjs().startOf("week"))}>
                            Aujourd’hui
                        </button>

                        <button className="owner-staffPlanning__btn" onClick={() => setWeekStart((w) => w.add(7, "day"))}>
                            Semaine →
                        </button>
                    </div>
                </header>

                {loading && <p>Chargement…</p>}
                {error && <p className="owner-staffPlanning__error">{error}</p>}

                {!loading && !error && (
                    <section className="owner-staffPlanning__grid">
                        {Array.from({ length: 7 }).map((_, i) => {
                            const d = weekStart.add(i, "day");
                            const key = d.format("YYYY-MM-DD");
                            const list = byDay.get(key) ?? [];

                            return (
                                <div key={key} className="owner-staffPlanning__col">
                                    <div className="owner-staffPlanning__colHeader">
                                        <div className="day">{d.format("ddd")}</div>
                                        <div className="date">{d.format("DD/MM")}</div>
                                    </div>

                                    <div className="owner-staffPlanning__colBody">
                                        {list.length === 0 ? (
                                            <div className="empty">Aucun RDV</div>
                                        ) : (
                                            list.map((a) => {
                                                const client =
                                                    `${a.userId?.firstName ?? ""} ${a.userId?.lastName ?? ""}`.trim() ||
                                                    a.userId?.email ||
                                                    "Client";
                                                const service = a.serviceId?.name ?? "Prestation";

                                                return (
                                                    <article key={a._id} className="appt">
                                                        <div className="time">
                                                            {dayjs(a.startAt).format("HH:mm")}–{dayjs(a.endAt).format("HH:mm")}
                                                        </div>
                                                        <div className="title">{service}</div>
                                                        <div className="meta">{client}</div>
                                                    </article>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </section>
                )}
            </main>
        </div>
    );
};

export default OwnerStaffPlanningPage;
