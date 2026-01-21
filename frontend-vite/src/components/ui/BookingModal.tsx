import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";

import "../../styles/components/_clientModals.scss";

import type { ServiceItem } from "../../services/services.service";
import { getAvailability, type AvailabilityItem } from "../../services/appointments.service";
import { getStaff, type StaffItem } from "../../services/staff.service";

type Props = {
    open: boolean;
    service: ServiceItem | null;

    // si report : pré-sélection coiffeur
    initialStaffId?: string | null;

    onClose: () => void;

    // renvoie aussi staffId
    onConfirm: (payload: { serviceId: string; dateTimeISO: string; staffId: string }) => void;
};

const BookingModal: React.FC<Props> = ({ open, service, initialStaffId, onClose, onConfirm }) => {
    const [selectedDay, setSelectedDay] = useState(() => dayjs().startOf("day"));
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

    const [slots, setSlots] = useState<AvailabilityItem[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);

    const [staff, setStaff] = useState<StaffItem[]>([]);
    const [loadingStaff, setLoadingStaff] = useState(false);
    const [staffId, setStaffId] = useState<string>("");

    //  reset propre quand on ouvre/ferme ou change de service
    useEffect(() => {
        if (!open) {
            setSelectedDay(dayjs().startOf("day"));
            setSelectedSlot(null);
            setSlots([]);
            setStaff([]);
            setStaffId("");
            return;
        }

        // quand le modal s’ouvre
        setSelectedDay(dayjs().startOf("day"));
        setSelectedSlot(null);
        setSlots([]);
    }, [open, service?._id]);

    //  charger coiffeurs quand modal s’ouvre
    useEffect(() => {
        if (!open) return;

        (async () => {
            try {
                setLoadingStaff(true);
                const data = await getStaff();
                setStaff(data);

                // pré-sélection
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

    //  charger dispos selon date + staffId
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
    }, [open, service?._id, selectedDay, staffId]);

    const handleConfirm = () => {
        if (!service || !selectedSlot || !staffId) return;

        onConfirm({
            serviceId: service._id,
            dateTimeISO: selectedSlot,
            staffId,
        });
    };

    if (!open || !service) return null;

    //  affichage prix promo
    const hasPromo = typeof service.priceFinal === "number" && service.priceFinal < service.price;

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

                            {/*  Prix normal / promo */}
                            {hasPromo ? (
                                <>
                  <span
                      className="client-pill client-pill--soft"
                      style={{ textDecoration: "line-through", opacity: 0.7 }}
                  >
                    {service.price} €
                  </span>

                                    <span className="client-pill client-pill--soft" style={{ fontWeight: 800 }}>
                    {service.priceFinal} €
                  </span>

                                    <span className="client-pill" style={{ fontWeight: 800 }}>
                    Promo
                  </span>
                                </>
                            ) : (
                                <span className="client-pill client-pill--soft">{service.price} €</span>
                            )}
                        </div>
                    </div>

                    {/* Coiffeur */}
                    <div style={{ marginBottom: 12 }}>
                        <div style={{ fontWeight: 700, marginBottom: 6, color: "#0f172a" }}>
                            Choisir un coiffeur
                        </div>

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
