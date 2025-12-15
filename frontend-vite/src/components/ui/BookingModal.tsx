// FRONTEND
// BookingModal branché backend :
// - charge disponibilités via GET /appointments/availability
// - confirme via onConfirm (qui fera POST)

import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import "../../styles/components/_clientModals.scss";
import type { ServiceItem } from "../../services/services.service";
import { getAvailability, type AvailabilityItem } from "../../services/appointments.service";

type Props = {
    open: boolean;
    service: ServiceItem | null;
    onClose: () => void;
    onConfirm: (payload: { serviceId: string; dateTimeISO: string }) => void;
};

const BookingModal: React.FC<Props> = ({ open, service, onClose, onConfirm }) => {
    if (!open || !service) return null;

    const [selectedDay, setSelectedDay] = useState(() => dayjs().startOf("day"));
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

    //  slots depuis backend
    const [slots, setSlots] = useState<AvailabilityItem[]>([]);
    const [loading, setLoading] = useState(false);

    const days = useMemo(() => {
        return Array.from({ length: 7 }).map((_, i) => dayjs().add(i, "day").startOf("day"));
    }, []);

    //  Charge les dispo à chaque changement de jour
    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                setSelectedSlot(null);

                // ⚠️ Backend attend YYYY-MM-DD
                const dateStr = selectedDay.format("YYYY-MM-DD");
                const data = await getAvailability(dateStr);
                setSlots(data);
            } finally {
                setLoading(false);
            }
        })();
    }, [selectedDay]);

    const handleConfirm = () => {
        if (!selectedSlot) return;
        onConfirm({ serviceId: service._id, dateTimeISO: selectedSlot });
    };

    return (
        <div className="client-modal__backdrop" onClick={onClose}>
            <div className="client-modal client-modal--wide" onClick={(e) => e.stopPropagation()}>
                <div className="client-modal__header">
                    <h2>Prendre rendez-vous</h2>
                    <button className="client-modal__close" onClick={onClose} aria-label="Fermer">
                        ✕
                    </button>
                </div>

                <div className="client-booking">
                    <div className="client-booking__service">
                        <div className="client-booking__name">{service.name}</div>
                        <div className="client-booking__meta">
                            <span className="client-pill">{service.category}</span>
                            {typeof service.price === "number" && (
                                <span className="client-pill client-pill--soft">{service.price} €</span>
                            )}
                        </div>
                    </div>

                    <div className="client-booking__days">
                        {days.map((d) => {
                            const isActive = d.isSame(selectedDay, "day");
                            return (
                                <button
                                    key={d.toISOString()}
                                    className={`day-chip ${isActive ? "day-chip--active" : ""}`}
                                    onClick={() => setSelectedDay(d)}
                                >
                                    <div className="day-chip__top">{d.format("ddd")}</div>
                                    <div className="day-chip__bottom">{d.format("DD/MM")}</div>
                                </button>
                            );
                        })}
                    </div>

                    {/*  Créneaux venant du backend */}
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
                                        disabled={!s.available} // ✅ si déjà pris
                                        onClick={() => setSelectedSlot(s.dateTimeISO)}
                                        title={!s.available ? "Déjà réservé" : "Choisir ce créneau"}
                                        style={!s.available ? { opacity: 0.4, cursor: "not-allowed" } : undefined}
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                    </div>

                    <div className="client-modal__actions">
                        <button className="client-btn client-btn--ghost" onClick={onClose}>
                            Annuler
                        </button>

                        <button
                            className="client-btn client-btn--primary"
                            disabled={!selectedSlot}
                            onClick={handleConfirm}
                            title={!selectedSlot ? "Choisissez un horaire" : "Confirmer le rendez-vous"}
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
