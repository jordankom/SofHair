import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";

import "../../styles/components/_clientModals.scss";

import type { ServiceItem } from "../../services/services.service";
import {
    getAvailability,
    type AvailabilityItem,
} from "../../services/appointments.service";

/**
 * Props du modal de réservation
 */
type Props = {
    open: boolean; // true => modal visible
    service: ServiceItem | null; // prestation sélectionnée
    onClose: () => void; // fermeture du modal
    onConfirm: (payload: { serviceId: string; dateTimeISO: string }) => void; // confirmation
};

/**
 * Modal de réservation de rendez-vous
 * - affiche les jours + créneaux disponibles
 * - charge les disponibilités depuis le backend
 * - empêche les conflits (slots déjà pris)
 */
const BookingModal: React.FC<Props> = ({ open, service, onClose, onConfirm }) => {
    /* ===================== */
    /* ÉTAT LOCAL            */
    /* ===================== */

    // Jour sélectionné (par défaut aujourd'hui)
    const [selectedDay, setSelectedDay] = useState(() =>
        dayjs().startOf("day")
    );

    // Créneau sélectionné (ISO string)
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

    // Créneaux venant du backend
    const [slots, setSlots] = useState<AvailabilityItem[]>([]);

    // Indique si on charge les créneaux
    const [loading, setLoading] = useState(false);

    /* ===================== */
    /* RESET SI SERVICE CHANGE */
    /* ===================== */
    useEffect(() => {
        // Quand on change de prestation :
        // - on reset le jour
        // - on reset le créneau
        // - on vide les slots
        setSelectedDay(dayjs().startOf("day"));
        setSelectedSlot(null);
        setSlots([]);
    }, [service?._id]);

    /* ===================== */
    /* LISTE DES JOURS (7j)   */
    /* ===================== */
    const days = useMemo(() => {
        return Array.from({ length: 7 }).map((_, i) =>
            dayjs().add(i, "day").startOf("day")
        );
    }, []);

    /* ===================== */
    /* CHARGEMENT DES DISPOS  */
    /* ===================== */
    useEffect(() => {
        // Si le modal est fermé ou qu'aucune prestation n'est sélectionnée,
        // on ne fait rien
        if (!open || !service) return;

        (async () => {
            try {
                setLoading(true);
                setSelectedSlot(null);

                // Le backend attend un format YYYY-MM-DD
                const dateStr = selectedDay.format("YYYY-MM-DD");

                const data = await getAvailability(dateStr);
                setSlots(data);
            } catch (err) {
                // En cas d'erreur, on vide les créneaux
                setSlots([]);
            } finally {
                setLoading(false);
            }
        })();
    }, [open, service, selectedDay]);

    /* ===================== */
    /* CONFIRMATION RDV       */
    /* ===================== */
    const handleConfirm = () => {
        if (!service || !selectedSlot) return;

        onConfirm({
            serviceId: service._id,
            dateTimeISO: selectedSlot,
        });
    };

    /* ===================== */
    /* RENDER CONDITIONNEL    */
    /* ===================== */
    // ⚠️ IMPORTANT :
    // Le return conditionnel est placé APRÈS les hooks
    if (!open || !service) return null;

    /* ===================== */
    /* RENDER                 */
    /* ===================== */
    return (
        // Backdrop : cliquer en dehors ferme le modal
        <div className="client-modal__backdrop" onClick={onClose}>
            {/* stopPropagation : cliquer dans la boîte ne ferme pas */}
            <div
                className="client-modal client-modal--wide"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ===================== */}
                {/* HEADER                 */}
                {/* ===================== */}
                <div className="client-modal__header">
                    <h2>Prendre rendez-vous</h2>
                    <button
                        className="client-modal__close"
                        onClick={onClose}
                        aria-label="Fermer"
                    >
                        ✕
                    </button>
                </div>

                {/* ===================== */}
                {/* CONTENU                */}
                {/* ===================== */}
                <div className="client-booking">
                    {/* ===== Service sélectionné ===== */}
                    <div className="client-booking__service">
                        <div className="client-booking__name">{service.name}</div>

                        <div className="client-booking__meta">
                            <span className="client-pill">{service.category}</span>

                            {typeof service.price === "number" && (
                                <span className="client-pill client-pill--soft">
                  {service.price} €
                </span>
                            )}
                        </div>
                    </div>

                    {/* ===== Sélecteur de jours ===== */}
                    <div className="client-booking__days">
                        {days.map((d) => {
                            const isActive = d.isSame(selectedDay, "day");

                            return (
                                <button
                                    key={d.toISOString()}
                                    className={`day-chip ${
                                        isActive ? "day-chip--active" : ""
                                    }`}
                                    onClick={() => setSelectedDay(d)}
                                >
                                    <div className="day-chip__top">{d.format("ddd")}</div>
                                    <div className="day-chip__bottom">
                                        {d.format("DD/MM")}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* ===== Créneaux horaires ===== */}
                    <div className="client-booking__slots">
                        {loading && <p>Chargement des créneaux…</p>}

                        {!loading &&
                            slots.map((s) => {
                                const label = dayjs(s.dateTimeISO).format("HH:mm");
                                const isActive = selectedSlot === s.dateTimeISO;

                                return (
                                    <button
                                        key={s.dateTimeISO}
                                        className={`slot ${isActive ? "slot--active" : ""}`}
                                        disabled={!s.available}
                                        onClick={() => setSelectedSlot(s.dateTimeISO)}
                                        title={
                                            s.available
                                                ? "Choisir ce créneau"
                                                : "Déjà réservé"
                                        }
                                        style={
                                            !s.available
                                                ? { opacity: 0.4, cursor: "not-allowed" }
                                                : undefined
                                        }
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                    </div>

                    {/* ===================== */}
                    {/* ACTIONS                */}
                    {/* ===================== */}
                    <div className="client-modal__actions">
                        <button
                            className="client-btn client-btn--ghost"
                            onClick={onClose}
                        >
                            Annuler
                        </button>

                        <button
                            className="client-btn client-btn--primary"
                            disabled={!selectedSlot}
                            onClick={handleConfirm}
                            title={
                                !selectedSlot
                                    ? "Choisissez un horaire"
                                    : "Confirmer le rendez-vous"
                            }
                        >
                            Confirmer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingModal;
