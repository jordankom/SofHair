// FRONTEND
// OwnerAppointmentsPage - Vue calendrier SEMAINE (comme ton image2)
// - Semaine (Lun → Dim) autour de la date choisie
// - Heures à gauche + jours en colonnes
// - RDV positionnés (top/height) + gestion des overlaps (lanes)
// - Filtres/tri conservés

import React, { useEffect, useMemo, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import OwnerSidebar from "../../components/layout/OwnerSidebar";
import "../../styles/pages/_ownerAppointments.scss";
import { fetchOwnerAppointments, type OwnerAppointment } from "../../services/appointmentsOwner.service";

dayjs.extend(isoWeek);

const START_HOUR = 8;
const END_HOUR = 19;
const SLOT_MINUTES = 30; // juste pour le quadrillage (visuel)

type TimeFilter = "all" | "morning" | "afternoon";
type SortOrder = "asc" | "desc";

type CalendarCard = {
    id: string;

    // data
    startAt: Dayjs;
    endAt: Dayjs;
    client: string;
    service: string;

    // placement
    dayIndex: number; // 0..6 (lun..dim)
    topPx: number;
    heightPx: number;

    // overlap lanes
    laneIndex: number;
    laneCount: number;
};

function buildWeekDays(anchorDateYYYYMMDD: string) {
    const anchor = dayjs(anchorDateYYYYMMDD);
    const start = anchor.startOf("isoWeek"); // Lundi
    return Array.from({ length: 7 }).map((_, i) => start.add(i, "day"));
}

// Algorithme simple “interval graph coloring” par journée (greedy)
// => donne laneIndex + laneCount pour éviter chevauchements
function assignLanes(cards: CalendarCard[]) {
    // group by day
    const byDay = new Map<number, CalendarCard[]>();
    for (const c of cards) {
        const arr = byDay.get(c.dayIndex) ?? [];
        arr.push(c);
        byDay.set(c.dayIndex, arr);
    }

    const out: CalendarCard[] = [];

    for (const [dayIndex, dayCards] of byDay.entries()) {
        // tri par heure début
        const sorted = [...dayCards].sort((a, b) => a.startAt.valueOf() - b.startAt.valueOf());

        // lanes = tableau des “endAt” du dernier rdv dans chaque lane
        const laneEnds: Dayjs[] = [];

        // on garde une trace des lanes utilisées pour calculer laneCount max d’un “cluster”
        // (approx simple : on calcule le max lanes utilisées sur la journée)
        let maxLanes = 1;

        const placed = sorted.map((c) => {
            // trouve une lane dispo (fin <= start)
            let lane = laneEnds.findIndex((end) => !end || end.isSame(c.startAt) || end.isBefore(c.startAt));

            if (lane === -1) {
                lane = laneEnds.length;
                laneEnds.push(c.endAt);
            } else {
                laneEnds[lane] = c.endAt;
            }

            maxLanes = Math.max(maxLanes, laneEnds.length);

            return { ...c, laneIndex: lane, laneCount: 1 };
        });

        // on met laneCount = maxLanes pour cette journée (simple + efficace)
        out.push(...placed.map((c) => ({ ...c, dayIndex, laneCount: maxLanes })));
    }

    return out;
}

const OwnerAppointmentsPage: React.FC = () => {
    // date sélectionnée (anchor de la semaine)
    const [date, setDate] = useState(() => dayjs().format("YYYY-MM-DD"));

    // data backend
    const [appointments, setAppointments] = useState<OwnerAppointment[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // UI filters
    const [q, setQ] = useState("");
    const [serviceFilter, setServiceFilter] = useState("");
    const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
    const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

    const weekDays = useMemo(() => buildWeekDays(date), [date]);

    // fetch semaine (7 appels / jour) — simple et OK pour maintenant
    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                setError(null);

                const results = await Promise.all(weekDays.map((d) => fetchOwnerAppointments(d.format("YYYY-MM-DD"))));
                const merged = results.flat();

                setAppointments(merged);
            } catch (e: any) {
                setError(e?.response?.data?.message || "Impossible de charger les rendez-vous.");
            } finally {
                setLoading(false);
            }
        })();
    }, [weekDays]);

    // options prestations (dérivées de la semaine chargée)
    const serviceOptions = useMemo(() => {
        const names = appointments
            .map((a) => a.serviceId?.name ?? "Prestation")
            .filter(Boolean);
        return Array.from(new Set(names)).sort();
    }, [appointments]);

    // minutes -> px (1 minute = 2px => journée 11h = 1320px, lisible)
    const PX_PER_MIN = 2;
    const dayHeightPx = (END_HOUR - START_HOUR) * 60 * PX_PER_MIN;

    // build cards + filters + sorting
    const cards = useMemo(() => {
        const query = q.trim().toLowerCase();

        // Helper : index jour 0..6 basé sur weekDays
        const dayIndexOf = (dt: Dayjs) => {
            const idx = weekDays.findIndex((d) => d.isSame(dt, "day"));
            return idx; // -1 si hors semaine (normalement non)
        };

        let base: CalendarCard[] = appointments
            .map((a) => {
                const start = dayjs(a.startAt);
                const end = dayjs(a.endAt);

                const idx = dayIndexOf(start);
                if (idx < 0) return null;

                // clamp dans la fenêtre horaire
                const dayStart = weekDays[idx].hour(START_HOUR).minute(0).second(0).millisecond(0);
                const dayEnd = weekDays[idx].hour(END_HOUR).minute(0).second(0).millisecond(0);

                const clampedStart = start.isBefore(dayStart) ? dayStart : start;
                const clampedEnd = end.isAfter(dayEnd) ? dayEnd : end;

                const minutesFromStart = clampedStart.diff(dayStart, "minute");
                const durationMinutes = Math.max(15, clampedEnd.diff(clampedStart, "minute")); // min height

                const clientName =
                    `${a.userId?.firstName ?? ""} ${a.userId?.lastName ?? ""}`.trim() || a.userId?.email || "Client";

                const serviceName = a.serviceId?.name ?? "Prestation";

                return {
                    id: a._id,
                    startAt: start,
                    endAt: end,
                    client: clientName,
                    service: serviceName,
                    dayIndex: idx,
                    topPx: minutesFromStart * PX_PER_MIN,
                    heightPx: durationMinutes * PX_PER_MIN,
                    laneIndex: 0,
                    laneCount: 1,
                } as CalendarCard;
            })
            .filter(Boolean) as CalendarCard[];

        // filtres
        base = base.filter((c) => {
            // search
            const matchesQ =
                !query || c.client.toLowerCase().includes(query) || c.service.toLowerCase().includes(query);

            // service filter
            const matchesService = !serviceFilter || c.service === serviceFilter;

            // morning/afternoon
            const hour = c.startAt.hour();
            const matchesTime =
                timeFilter === "all" || (timeFilter === "morning" ? hour < 12 : hour >= 12);

            return matchesQ && matchesService && matchesTime;
        });

        // tri
        base.sort((a, b) =>
            sortOrder === "asc" ? a.startAt.valueOf() - b.startAt.valueOf() : b.startAt.valueOf() - a.startAt.valueOf()
        );

        // lanes
        return assignLanes(base);
    }, [appointments, q, serviceFilter, timeFilter, sortOrder, weekDays]);

    // Liste des heures à gauche
    const hourRows = useMemo(() => {
        const out: string[] = [];
        for (let h = START_HOUR; h <= END_HOUR; h++) out.push(String(h).padStart(2, "0") + ":00");
        return out;
    }, []);

    return (
        <div className="owner-layout">
            <OwnerSidebar />

            <main className="owner-layout__main owner-appointments">
                <header className="owner-appointments__header">
                    <div className="owner-appointments__headerLeft">
                        <div>
                            <h1>Rendez-vous</h1>
                            <p>Gérez vos rendez-vous de la journée.</p>
                        </div>


                    </div>

                    <div className="owner-appointments__headerRight">

                        <button
                            className="owner-appointments__add-btn"
                            onClick={() => console.log("Créer un nouveau RDV")}
                        >
                            + Nouveau RDV
                        </button>
                        <input
                            type="date"
                            className="owner-appointments__date-input"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />

                        <input
                            className="owner-appointments__search"
                            placeholder="Rechercher (client / prestation)"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                        />



                        <select
                            className="owner-appointments__select"
                            value={serviceFilter}
                            onChange={(e) => setServiceFilter(e.target.value)}
                        >
                            <option value="">Toutes les prestations</option>
                            {serviceOptions.map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>

                        <select
                            className="owner-appointments__select"
                            value={timeFilter}
                            onChange={(e) => setTimeFilter(e.target.value as any)}
                        >
                            <option value="all">Toute la journée</option>
                            <option value="morning">Matin</option>
                            <option value="afternoon">Après-midi</option>
                        </select>

                        <button
                            className="owner-appointments__sort-btn"
                            onClick={() => setSortOrder((p) => (p === "asc" ? "desc" : "asc"))}
                            title="Inverser le tri"
                        >
                            Tri : {sortOrder === "asc" ? "⬆" : "⬇"}
                        </button>
                    </div>
                </header>

                {error && <p className="owner-appointments__error">{error}</p>}
                {loading && <p>Chargement des rendez-vous...</p>}

                {/* ====== CALENDRIER ====== */}
                <section className="owner-cal">
                    {/* header jours */}
                    <div className="owner-cal__head">
                        <div className="owner-cal__head-left" />
                        <div className="owner-cal__head-days">
                            {weekDays.map((d) => (
                                <div key={d.toISOString()} className="owner-cal__head-day">
                                    <div className="owner-cal__dow">{d.format("ddd")}</div>
                                    <div className="owner-cal__date">{d.format("D")}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* body */}
                    <div className="owner-cal__body">
                        {/* colonne heures */}
                        <div className="owner-cal__hours" style={{ height: dayHeightPx }}>
                            {hourRows.map((h) => (
                                <div key={h} className="owner-cal__hour">
                                    {h}
                                </div>
                            ))}
                        </div>

                        {/* grille jours */}
                        <div className="owner-cal__grid" style={{ height: dayHeightPx }}>
                            {weekDays.map((d) => (
                                <div key={d.toISOString()} className="owner-cal__dayCol">
                                    {/* lignes 30 min (visuel) */}
                                    {Array.from({ length: ((END_HOUR - START_HOUR) * 60) / SLOT_MINUTES }).map((_, i) => (
                                        <div key={i} className="owner-cal__slotLine" />
                                    ))}
                                </div>
                            ))}

                            {/* RDV (layer absolute au-dessus) */}
                            <div className="owner-cal__eventsLayer" style={{ height: dayHeightPx }}>
                                {!loading && !error && cards.map((c) => {
                                    const colWidthPercent = 100 / 7;

                                    // placement horizontal : colonne du jour + lanes
                                    const dayLeftPercent = c.dayIndex * colWidthPercent;

                                    // marge interne + gestion lanes
                                    const innerPad = 1; // %
                                    const usable = colWidthPercent - innerPad * 2;

                                    const laneWidth = usable / c.laneCount;
                                    const left = dayLeftPercent + innerPad + laneWidth * c.laneIndex;
                                    const width = laneWidth;

                                    return (
                                        <article
                                            key={c.id}
                                            className="owner-cal__event"
                                            style={{
                                                top: c.topPx,
                                                height: c.heightPx,
                                                left: `${left}%`,
                                                width: `${width}%`,
                                            }}
                                            title={`${c.service} • ${c.client}`}
                                        >
                                            <div className="owner-cal__eventTime">
                                                {c.startAt.format("HH:mm")}–{c.endAt.format("HH:mm")}
                                            </div>
                                            <div className="owner-cal__eventTitle">{c.service}</div>
                                            <div className="owner-cal__eventSub">{c.client}</div>
                                        </article>
                                    );
                                })}

                                {!loading && !error && cards.length === 0 && (
                                    <div className="owner-cal__empty">
                                        Aucun rendez-vous pour ces filtres.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default OwnerAppointmentsPage;
