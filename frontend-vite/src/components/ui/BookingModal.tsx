import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";

import "../../styles/components/_clientModals.scss";

import type { ServiceItem } from "../../services/services.service";
import { getAvailability, type AvailabilityItem } from "../../services/appointments.service";
import { getStaff, type StaffItem } from "../../services/staff.service";

/**
 * Props du modal de réservation / report
 */
type Props = {
    open: boolean;
    service: ServiceItem | null;

    // ✅ si on reporte, on peut pré-sélectionner le coiffeur actuel
    initialStaffId?: string | null;

    onClose: () => void;

    // ✅ on renvoie aussi staffId maintenant
    onConfirm: (payload: { serviceId: string; dateTimeISO: string; staffId: string }) => void;
};

const BookingModal: React.FC<Props> = ({ open, service, initialStaffId, onClose, onConfirm }) => {
    // jour sélectionné
    const [selectedDay, setSelectedDay] = useState(() => dayjs().startOf("day"));

    // slot sélectionné
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

    // liste des créneaux dispo
    const [slots, setSlots] = useState<AvailabilityItem[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);

    //  staff
    const [staff, setStaff] = useState<StaffItem[]>([]);
    const [loadingStaff, setLoadingStaff] = useState(false);
    const [staffId, setStaffId] = useState<string>("");

    // reset quand service change
    useEffect(() => {
        setSelectedDay(dayjs().startOf("day"));
        setSelectedSlot(null);
        setSlots([]);
    }, [service?._id]);

    //  charger la liste de coiffeurs quand modal s’ouvre
    useEffect(() => {
        if (!open) return;

        (async () => {
            try {
                setLoadingStaff(true);
                const data = await getStaff();
                setStaff(data);

                // pré-sélection :
                // - si initialStaffId existe et est dans la liste => on l’utilise
                // - sinon on prend le premier coiffeur
                const found = initialStaffId && data.some((s) => s._id === initialStaffId);
                if (found) setStaffId(initialStaffId!);
                else if (data.length > 0) setStaffId(data[0]._id);
                else setStaffId("");
            } catch {
                setStaff([]);
                setStaffId("");
            } finally {
                setLoadingStaff(false);
            }
        })();
    }, [open, initialStaffId]);

    // 7 jours
    const days = useMemo(() => {
        return Array.from({ length: 7 }).map((_, i) => dayjs().add(i, "day").startOf("day"));
    }, []);

    //  charger les dispos selon date + staffId
    useEffect(() => {
        if (!open || !service) return;
        if (!staffId) return;

        (async () => {
            try {
                setLoadingSlots(true);
                setSelectedSlot(null);

                const dateStr = selectedDay.format("YYYY-MM-DD");
                const data = await getAvailability(dateStr, staffId);
                setSlots(data);
            } catch {
                setSlots([]);
            } finally {
                setLoadingSlots(false);
            }
        })();
    }, [open, service, selectedDay, staffId]);

    const handleConfirm = () => {
        if (!service || !selectedSlot || !staffId) return;

        onConfirm({
            serviceId: service._id,
            dateTimeISO: selectedSlot,
            staffId,
        });
    };

    if (!open || !service) return null;

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
                    {/* Service */}
                    <div className="client-booking__service">
                        <div className="client-booking__name">{service.name}</div>
                        <div className="client-booking__meta">
                            <span className="client-pill">{service.category}</span>
                            {typeof service.price === "number" && (
                                <span className="client-pill client-pill--soft">{service.price} €</span>
                            )}
                        </div>
                    </div>

                    {/* ✅ COIFFEUR */}
                    <div style={{ marginBottom: 12 }}>
                        <div style={{ fontWeight: 700, marginBottom: 6, color: "#0f172a" }}>Choisir un coiffeur</div>

                        {loadingStaff ? (
                            <p style={{ margin: 0, color: "#64748b" }}>Chargement de l’équipe…</p>
                        ) : staff.length === 0 ? (
                            <p style={{ margin: 0, color: "#b91c1c" }}>Aucun coiffeur disponible.</p>
                        ) : (
                            <select
                                value={staffId}
                                onChange={(e) => setStaffId(e.target.value)}
                                className="client-services__filter"
                                style={{ width: "100%" }}
                            >
                                {staff.map((s) => (
                                    <option key={s._id} value={s._id}>
                                        {s.firstName} {s.lastName}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>

                    {/* Jours */}
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

                    {/* Slots */}
                    <div className="client-booking__slots">
                        {loadingSlots && <p>Chargement des créneaux…</p>}

                        {!loadingSlots &&
                            slots.map((s) => {
                                const label = dayjs(s.dateTimeISO).format("HH:mm");
                                const isActive = selectedSlot === s.dateTimeISO;

                                return (
                                    <button
                                        key={s.dateTimeISO}
                                        className={`slot ${isActive ? "slot--active" : ""}`}
                                        disabled={!s.available}
                                        onClick={() => setSelectedSlot(s.dateTimeISO)}
                                        title={s.available ? "Choisir ce créneau" : "Déjà réservé"}
                                        style={!s.available ? { opacity: 0.4, cursor: "not-allowed" } : undefined}
                                    >
                                        {label}
                                    </button>
                                );
                            })}
                    </div>

                    {/* Actions */}
                    <div className="client-modal__actions">
                        <button className="client-btn client-btn--ghost" onClick={onClose}>
                            Annuler
                        </button>

                        <button
                            className="client-btn client-btn--primary"
                            disabled={!selectedSlot || !staffId || staff.length === 0}
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
