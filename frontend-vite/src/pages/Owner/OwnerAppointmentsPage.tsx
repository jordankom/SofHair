// FRONTEND
// Page RDV Owner + filtres/tri (UI simple)
// - filtre texte (client / prestation)
// - filtre prestation
// - filtre matin/aprem
// - tri heure asc/desc

import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import OwnerSidebar from "../../components/layout/OwnerSidebar";
import "../../styles/pages/_ownerAppointments.scss";
import { fetchOwnerAppointments, type OwnerAppointment } from "../../services/appointmentsOwner.service";

const HOURS = ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00"];

const OwnerAppointmentsPage: React.FC = () => {
    //  date sélectionnée (par défaut aujourd’hui)
    const [date, setDate] = useState(() => dayjs().format("YYYY-MM-DD"));

    //  données backend
    const [appointments, setAppointments] = useState<OwnerAppointment[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    //  Filtres/tri (nouveau)
    const [q, setQ] = useState("");                         // 🔎 recherche texte
    const [serviceFilter, setServiceFilter] = useState(""); // 🎯 prestation
    const [timeFilter, setTimeFilter] = useState<"all" | "morning" | "afternoon">("all"); // 🌤
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc"); // ⬆⬇

    //  fetch à chaque changement de date
    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await fetchOwnerAppointments(date);
                setAppointments(data);
            } catch (e: any) {
                setError(e?.response?.data?.message || "Impossible de charger les rendez-vous.");
            } finally {
                setLoading(false);
            }
        })();
    }, [date]);

    //  cartes “prêtes à afficher”
    const cards = useMemo(() => {
        return appointments.map((a) => {
            const start = dayjs(a.startAt);
            const end = dayjs(a.endAt);

            const clientName =
                `${a.userId?.firstName ?? ""} ${a.userId?.lastName ?? ""}`.trim() || a.userId?.email;

            return {
                id: a._id,
                startAtISO: a.startAt,
                startHour: start.hour(), //  utile pour matin/aprem
                time: `${start.format("HH:mm")} - ${end.format("HH:mm")}`,
                client: clientName,
                service: a.serviceId?.name ?? "Prestation",
                category: a.serviceId?.category ?? "",
                price: a.serviceId?.price,
            };
        });
    }, [appointments]);

    // liste des prestations pour le select (dérivée des RDV du jour)
    const serviceOptions = useMemo(() => {
        return Array.from(new Set(cards.map((c) => c.service))).sort();
    }, [cards]);

    //  application filtres + tri
    const filteredCards = useMemo(() => {
        const query = q.trim().toLowerCase();

        let out = cards.filter((c) => {
            //  recherche texte sur client + prestation
            const matchesQ =
                !query ||
                c.client.toLowerCase().includes(query) ||
                c.service.toLowerCase().includes(query);

            //  filtre prestation
            const matchesService = !serviceFilter || c.service === serviceFilter;

            //  filtre matin/aprem (matin < 12, aprem >= 12)
            const matchesTime =
                timeFilter === "all" ||
                (timeFilter === "morning" ? c.startHour < 12 : c.startHour >= 12);

            return matchesQ && matchesService && matchesTime;
        });

        // ⬆⬇ tri horaire
        out.sort((a, b) =>
            sortOrder === "asc"
                ? dayjs(a.startAtISO).valueOf() - dayjs(b.startAtISO).valueOf()
                : dayjs(b.startAtISO).valueOf() - dayjs(a.startAtISO).valueOf()
        );

        return out;
    }, [cards, q, serviceFilter, timeFilter, sortOrder]);

    return (
        <div className="owner-layout">
            <OwnerSidebar />

            <main className="owner-layout__main owner-appointments">
                <header className="owner-appointments__header">
                    <div>
                        <h1>Rendez-vous</h1>
                        <p>Gérez vos rendez-vous de la journée.</p>
                    </div>
                    <button
                        className="owner-appointments__add-btn"
                        onClick={() => {
                            // pour l’instant simple feedback
                            console.log("Créer un nouveau RDV");
                        }}
                    >
                        + Nouveau RDV
                    </button>
                    <div className="owner-appointments__header-actions">
                        {/*  date */}
                        <input
                            type="date"
                            className="owner-appointments__date-input"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />

                        {/*  recherche */}
                        <input
                            className="owner-appointments__search"
                            placeholder="Rechercher (client / prestation)"
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                        />

                        {/*  filtre prestation */}
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

                        {/* 🌤 matin/aprem */}
                        <select
                            className="owner-appointments__select"
                            value={timeFilter}
                            onChange={(e) => setTimeFilter(e.target.value as any)}
                        >
                            <option value="all">Toute la journée</option>
                            <option value="morning">Matin</option>
                            <option value="afternoon">Après-midi</option>
                        </select>

                        {/* ⬆⬇ tri */}
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

                <section className="owner-appointments__content">
                    <div className="owner-appointments__time-column">
                        {HOURS.map((hour) => (
                            <div key={hour} className="owner-appointments__time-slot">
                                <span>{hour}</span>
                            </div>
                        ))}
                    </div>

                    <div className="owner-appointments__cards-column">
                        {!loading && !error && filteredCards.map((rdv) => (
                            <article key={rdv.id} className="owner-appointments__card">
                                <div className="owner-appointments__card-time">{rdv.time}</div>

                                <div className="owner-appointments__card-main">
                                    <h2 className="owner-appointments__card-service">{rdv.service}</h2>

                                    <p className="owner-appointments__card-client">
                                        Client : <strong>{rdv.client}</strong>
                                    </p>

                                    <p className="owner-appointments__card-stylist">
                                        {rdv.category ? `Catégorie : ${rdv.category}` : ""}
                                        {typeof rdv.price === "number" ? ` • ${rdv.price} €` : ""}
                                    </p>
                                </div>
                            </article>
                        ))}

                        {!loading && !error && filteredCards.length === 0 && (
                            <p className="owner-appointments__empty">
                                Aucun rendez-vous pour ces filtres.
                            </p>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default OwnerAppointmentsPage;
