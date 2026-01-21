import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

import ConfirmModal from "../../components/ui/ConfirmModal";
import BookingModal from "../../components/ui/BookingModal";
import Card from "../../components/ui/Card";

import {
    getMyAppointments,
    cancelAppointment,
    rescheduleAppointment,
    type MyAppointment,
} from "../../services/appointments.service";

import "../../styles/pages/_clientRdvs.scss";

/**
 * Filtres UI
 * - next: écran focus "prochain RDV" (par défaut)
 * - all: tout
 * - upcoming/past/cancelled: filtres simples
 */
type RdvFilter = "next" | "all" | "upcoming" | "past" | "cancelled";

const Rdvs: React.FC = () => {
    const navigate = useNavigate();
// Toast succès
    const [toast, setToast] = useState<string | null>(null);

    const [items, setItems] = useState<MyAppointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Filtre sélectionné
    const [filter, setFilter] = useState<RdvFilter>("next");

    // RDV sélectionné pour annulation (ouvre ConfirmModal)
    const [cancelTarget, setCancelTarget] = useState<MyAppointment | null>(null);

    // RDV sélectionné pour report (ouvre BookingModal)
    const [rescheduleTarget, setRescheduleTarget] = useState<MyAppointment | null>(null);
    const [openReschedule, setOpenReschedule] = useState(false);

    // Pour désactiver le bouton Annuler uniquement sur le RDV concerné
    const [cancellingId, setCancellingId] = useState<string | null>(null);

    // Pour éviter double click lors d'un report
    const [reschedulingId, setReschedulingId] = useState<string | null>(null);

    const showToast = (message: string) => {
        setToast(message);

        // Auto-disparition après 3 secondes
        setTimeout(() => {
            setToast(null);
        }, 3000);
    };


    /**
     * Charge / recharge la liste des RDV
     * (appelée au mount + après actions)
     */
    const refresh = async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await getMyAppointments();
            setItems(data);
        } catch (e: any) {
            const msg = e?.response?.data?.message || "Impossible de charger vos rendez-vous.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    // Chargement initial
    useEffect(() => {
        refresh();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /**
     * Ouvre le modal d'annulation
     */
    const askCancel = (appt: MyAppointment) => {
        setCancelTarget(appt);
    };

    /**
     * Confirme l'annulation (backend applique aussi la règle < 3h)
     */
    const confirmCancel = async () => {
        if (!cancelTarget) return;

        try {
            setCancellingId(cancelTarget._id);
            setError(null);

            await cancelAppointment(cancelTarget._id);

            // Fermer le modal
            setCancelTarget(null);

            // Refresh liste
            await refresh();
        } catch (e: any) {
            const msg = e?.response?.data?.message || "Impossible d'annuler ce rendez-vous.";
            setError(msg);
            // On garde le modal ouvert si backend refuse (ex: < 3h)
        } finally {
            setCancellingId(null);
        }
    };

    /**
     * Segmente : upcoming / past / cancelled
     */
    const { upcoming, past, cancelled } = useMemo(() => {
        const now = dayjs();

        const cancelled = items.filter((a) => a.status === "cancelled");
        const active = items.filter((a) => a.status !== "cancelled");

        const upcoming = active.filter((a) => dayjs(a.startAt).isAfter(now));
        const past = active.filter((a) => !dayjs(a.startAt).isAfter(now));

        return { upcoming, past, cancelled };
    }, [items]);

    /**
     * Prochain RDV = le plus proche dans le futur
     */
    const nextAppointment = useMemo(() => {
        if (upcoming.length === 0) return null;

        // Tri chronologique (du plus proche au plus loin)
        const sorted = [...upcoming].sort((a, b) => +new Date(a.startAt) - +new Date(b.startAt));
        return sorted[0] ?? null;
    }, [upcoming]);

    /**
     * Liste à afficher selon le filtre (quand on n'est pas sur "next")
     */
    const filteredList = useMemo(() => {
        switch (filter) {
            case "all":
                return items;
            case "upcoming":
                return upcoming;
            case "past":
                return past;
            case "cancelled":
                return cancelled;
            default:
                return []; // "next" -> pas de liste
        }
    }, [filter, items, upcoming, past, cancelled]);

    /**
     * Petit indicateur UI : moins de 3h avant le RDV
     * (on ne bloque pas forcément ici, backend = source de vérité)
     */
    const isTooLateToCancel = (appt: MyAppointment) => {
        const diffHours = dayjs(appt.startAt).diff(dayjs(), "hour", true);
        return diffHours < 3;
    };

    /**
     * Ouvre BookingModal pour reporter un RDV
     */
    const askReschedule = (appt: MyAppointment) => {
        setRescheduleTarget(appt);
        setOpenReschedule(true);
    };

    /**
     * Confirme le report (PATCH)
     * BookingModal renvoie : { serviceId, dateTimeISO }
     * -> pour report on a seulement besoin de dateTimeISO
     */
    const confirmReschedule = async (
        payload: { serviceId: string; dateTimeISO: string; staffId: string }
    ) => {
        if (!rescheduleTarget) return;

        try {
            setReschedulingId(rescheduleTarget._id);
            setError(null);

            await rescheduleAppointment(
                rescheduleTarget._id,
                {
                    dateTimeISO: payload.dateTimeISO,
                    staffId: payload.staffId, // ✅ B : envoyé au backend
                }
            );

            showToast("Rendez-vous reporté avec succès");
            setOpenReschedule(false);
            setRescheduleTarget(null);
            await refresh();
        } catch (e: any) {
            const msg =
                e?.response?.data?.message ||
                "Impossible de reporter ce rendez-vous.";
            setError(msg);
        } finally {
            setReschedulingId(null);
        }
    };


    /**
     * Construit un objet compatible avec BookingModal (ServiceItem)
     * depuis un MyAppointment (serviceId populé)
     */
    const bookingService = useMemo(() => {
        if (!rescheduleTarget?.serviceId) return null;

        return {
            _id: rescheduleTarget.serviceId._id,
            name: rescheduleTarget.serviceId.name,
            category: rescheduleTarget.serviceId.category,
            price: rescheduleTarget.serviceId.price?? 0,
            durationMinutes: rescheduleTarget.serviceId.durationMinutes ?? 30,
            imageUrl: rescheduleTarget.serviceId.imageUrl,
            description: rescheduleTarget.serviceId.description,
        };
    }, [rescheduleTarget]);

    return (
        <div className="client-rdvs">
            <div className="client-rdvs__header">
                <div>
                    <h1>Mes rendez-vous</h1>
                    <p>Gérez vos rendez-vous et votre prochain créneau.</p>
                </div>

                {/* Filtre en haut à droite */}
                <select
                    className="client-rdvs__filter"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as RdvFilter)}
                >
                    <option value="next">Prochain</option>
                    <option value="all">Tous</option>
                    <option value="upcoming">À venir</option>
                    <option value="past">Passés</option>
                    <option value="cancelled">Annulés</option>
                </select>
            </div>

            {loading && <p>Chargement…</p>}
            {error && <p className="client-rdvs__error">{error}</p>}

            {!loading && (
                <>
                    {/* =============================== */}
                    {/* Écran "Prochain" : SEUL élément */}
                    {/* =============================== */}
                    {filter === "next" && (
                        <div className="client-rdvs__center">
                            <div className="rdv-heroSquare">
                                {nextAppointment ? (
                                    <>
                                        {/* IMAGE */}
                                        <div className="rdv-heroSquare__image">
                                            {nextAppointment.serviceId?.imageUrl ? (
                                                <img
                                                    src={nextAppointment.serviceId.imageUrl}
                                                    alt={nextAppointment.serviceId.name ?? "Prestation"}
                                                />
                                            ) : (
                                                <div className="rdv-heroSquare__image--placeholder">Prestation</div>
                                            )}
                                        </div>

                                        {/* CONTENU */}
                                        <div className="rdv-heroSquare__content">
                                            <div className="rdv-heroSquare__kicker">Prochain rendez-vous</div>

                                            <h2 className="rdv-heroSquare__title">
                                                {nextAppointment.serviceId?.name ?? "Prestation"}
                                            </h2>

                                            <p className="rdv-heroSquare__subtitle">
                                                {dayjs(nextAppointment.startAt).format("dddd DD MMMM YYYY")} •{" "}
                                                {dayjs(nextAppointment.startAt).format("HH:mm")}
                                            </p>

                                            <div className="rdv-heroSquare__meta">
                                                {nextAppointment.serviceId?.category && (
                                                    <span className="client-pill">{nextAppointment.serviceId.category}</span>
                                                )}

                                                {typeof nextAppointment.serviceId?.price === "number" && (
                                                    <span className="client-pill client-pill--soft">
                            {nextAppointment.serviceId.price} €
                          </span>
                                                )}

                                                {nextAppointment.serviceId?.durationMinutes && (
                                                    <span className="client-pill client-pill--soft">
                            {nextAppointment.serviceId.durationMinutes} min
                          </span>
                                                )}

                                                {isTooLateToCancel(nextAppointment) && (
                                                    <span className="client-pill client-pill--soft">
                            Annulation verrouillée (&lt; 3h)
                          </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* ACTIONS */}
                                        <div className="rdv-heroSquare__actions">
                                            <button
                                                className="client-btn client-btn--soft"
                                                onClick={() => askReschedule(nextAppointment)}
                                                disabled={reschedulingId === nextAppointment._id}
                                                title="Reporter ce rendez-vous"
                                            >
                                                {reschedulingId === nextAppointment._id ? "Ouverture…" : "Reporter"}
                                            </button>

                                            <button
                                                className="client-btn client-btn--danger"
                                                onClick={() => askCancel(nextAppointment)}
                                                disabled={cancellingId === nextAppointment._id}
                                                title="Annuler ce rendez-vous"
                                            >
                                                {cancellingId === nextAppointment._id ? "Annulation…" : "Annuler"}
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {/* Aucun RDV */}
                                        <div className="rdv-heroSquare__image">
                                            <div className="rdv-heroSquare__image--placeholder">Aucun RDV</div>
                                        </div>

                                        <div className="rdv-heroSquare__content">
                                            <div className="rdv-heroSquare__kicker">Prochain rendez-vous</div>

                                            <h2 className="rdv-heroSquare__title">Aucun rendez-vous à venir</h2>

                                            <p className="rdv-heroSquare__subtitle">
                                                Réservez un créneau depuis “Services disponibles”.
                                            </p>

                                            <div className="rdv-heroSquare__meta">
                                                <span className="client-pill client-pill--soft">Astuce</span>
                                                <span className="client-pill client-pill--soft">
                          Choisissez une prestation pour voir les disponibilités
                        </span>
                                            </div>
                                        </div>

                                        <div className="rdv-heroSquare__actions">
                                            <button
                                                className="client-btn client-btn--primary"
                                                onClick={() => navigate("/client/services")}
                                                title="Aller aux services"
                                            >
                                                Voir les services
                                            </button>

                                            <button className="client-btn client-btn--ghost" disabled>
                                                Annuler
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* =============================== */}
                    {/* Autres filtres : liste filtrée */}
                    {/* =============================== */}
                    {filter !== "next" && (
                        <div className="client-rdvs__listWrap">
                            {filteredList.length === 0 ? (
                                <Card>
                                    <p style={{ margin: 0, color: "#475569" }}>
                                        Aucun rendez-vous pour ce filtre.
                                    </p>
                                </Card>
                            ) : (
                                filteredList.map((a) => (
                                    <article
                                        key={a._id}
                                        className={`rdv-card ${a.status === "cancelled" ? "rdv-card--muted" : ""}`}
                                    >
                                        <div className="rdv-card__main">
                                            <div className="rdv-card__title">{a.serviceId?.name ?? "Prestation"}</div>

                                            <div className="rdv-card__meta">
                                                <span>{dayjs(a.startAt).format("DD/MM/YYYY")}</span>
                                                <span>•</span>
                                                <span>{dayjs(a.startAt).format("HH:mm")}</span>

                                                {a.status === "cancelled" && (
                                                    <>
                                                        <span>•</span>
                                                        <span>Annulé</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions uniquement si à venir et non annulé */}
                                        {a.status !== "cancelled" && dayjs(a.startAt).isAfter(dayjs()) ? (
                                            <div className="rdv-card__actions">
                                                <button
                                                    className="client-btn client-btn--soft"
                                                    onClick={() => askReschedule(a)}
                                                    disabled={reschedulingId === a._id}
                                                >
                                                    {reschedulingId === a._id ? "…" : "Reporter"}
                                                </button>

                                                <button
                                                    className="client-btn client-btn--danger"
                                                    onClick={() => askCancel(a)}
                                                    disabled={cancellingId === a._id}
                                                >
                                                    {cancellingId === a._id ? "Annulation…" : "Annuler"}
                                                </button>
                                            </div>
                                        ) : null}
                                    </article>
                                ))
                            )}
                        </div>
                    )}
                </>
            )}

            {/* ===================== */}
            {/* MODAL : annulation */}
            {/* ===================== */}
            <ConfirmModal
                open={!!cancelTarget}
                title="Annuler ce rendez-vous ?"
                message={
                    cancelTarget
                        ? `Voulez-vous annuler "${cancelTarget.serviceId?.name ?? "Prestation"}" le ${dayjs(
                            cancelTarget.startAt
                        ).format("DD/MM/YYYY")} à ${dayjs(cancelTarget.startAt).format("HH:mm")} ?`
                        : ""
                }
                confirmLabel="Oui, annuler"
                cancelLabel="Non"
                loading={!!cancelTarget && cancellingId === cancelTarget._id}
                onClose={() => setCancelTarget(null)}
                onConfirm={confirmCancel}
            />

            {/* ===================== */}
            {/* MODAL : report (créneaux) */}
            {/* ===================== */}
            <BookingModal
                open={openReschedule}
                service={bookingService}
                initialStaffId={rescheduleTarget?.staffId ?? null}
                onClose={() => {
                    setOpenReschedule(false);
                    setRescheduleTarget(null);
                }}
                onConfirm={confirmReschedule}
            />

            {toast && (
                <div className="client-toast">
                    {toast}
                </div>
            )}

        </div>
    );
};

export default Rdvs;
