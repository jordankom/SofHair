// FRONTEND
// Page Services (client) :
//  catégories viennent du backend => toujours complètes
//  services filtrés via backend
//  clic sur une carte => modal détails
//  "Prendre RDV" => BookingModal
//  confirm => POST /appointments (backend)

import React, { useEffect, useState,useRef } from "react";
import ServiceDetailsModal from "../../components/ui/ServiceDetailsModal";
import BookingModal from "../../components/ui/BookingModal";

import {
    getServices,
    getServiceCategories,
    type ServiceItem,
} from "../../services/services.service";

//  appel backend RDV
import { createAppointment } from "../../services/appointments.service";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import "../../styles/pages/_clientServices.scss";

const Services: React.FC = () => {
    // Liste des services affichés (filtrés via backend)
    const [services, setServices] = useState<ServiceItem[]>([]);

    // Liste complète des catégories (vient du backend)
    const [categories, setCategories] = useState<string[]>([]);

    // Catégorie choisie dans le select
    const [category, setCategory] = useState<string>("");

    // Loading
    const [loading, setLoading] = useState(true);

    // Gestion erreurs (affichage propre)
    const [error, setError] = useState<string | null>(null);

    // Service sélectionné (quand on clique une carte)
    const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

    //  Ouverture des modals
    const [openDetails, setOpenDetails] = useState(false);
    const [openBooking, setOpenBooking] = useState(false);

    //  Empêche double clic / double POST
    const [bookingSubmitting, setBookingSubmitting] = useState(false);

    //  Pour rediriger vers login si pas connecté
    const navigate = useNavigate();
    const { user } = useAuth();

    //  Toast (message temporaire)
    const [toast, setToast] = useState<string | null>(null);

    //  Pour éviter plusieurs timers en même temps
    const toastTimerRef = useRef<number | null>(null);

    //  Nettoyage à l'unmount (important)
    useEffect(() => {
        return () => {
            if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
        };
    }, []);

    //  Fonction utilitaire : affiche un toast 3 sec
    const showToast = (message: string) => {
        setToast(message);

        // si un timer existe déjà, on le remplace
        if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);

        toastTimerRef.current = window.setTimeout(() => {
            setToast(null);
            toastTimerRef.current = null;
        }, 3  * 1000); // 3 secondes
    };

    const handleConfirmBooking = async (payload: { serviceId: string; dateTimeISO: string;staffId: string }) => {
        try {
            setBookingSubmitting(true);
            setError(null);

            await createAppointment({
                serviceId: payload.serviceId,
                dateTimeISO: payload.dateTimeISO,
                staffId: payload.staffId,
            });


            // affichage toast
            showToast("Réservation confirmée ✅");

            setOpenBooking(false);
            setSelectedService(null);
        } catch (e: any) {
            const msg =
                e?.response?.data?.message ||
                "Impossible de réserver ce créneau. Réessayez.";
            setError(msg);
        } finally {
            setBookingSubmitting(false);
        }
    };



    //  Charge les catégories 1 seule fois
    useEffect(() => {
        (async () => {
            try {
                const cats = await getServiceCategories();
                setCategories(cats);
            } catch {
                setCategories([]);
            }
        })();
    }, []);

    //  Recharge la liste dès que la catégorie change (filtre backend)
    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await getServices(category || undefined);
                setServices(data);
            } catch {
                setError("Impossible de charger les prestations pour le moment.");
            } finally {
                setLoading(false);
            }
        })();
    }, [category]);

    //  Quand on clique sur une carte on ouvre modal détails
    const handleOpenDetails = (service: ServiceItem) => {
        setSelectedService(service);
        setOpenDetails(true);
    };

    //  Quand on clique sur "Prendre RDV" dans le modal détails
    const handleOpenBooking = (service: ServiceItem) => {
        //  Si pas connecté => on redirige vers login
        // et on pourra revenir ici ensuite si tu utilises location.state (optionnel)
        if (!user) {
            navigate("/login");
            return;
        }

        setSelectedService(service);
        setOpenDetails(false);
        setOpenBooking(true);
    };


    return (
        <div className="client-services">
            <div className="client-services__header">
                <h1>Services disponibles</h1>

                {/* Filtre catégories (liste complète depuis le backend) */}
                <select
                    className="client-services__filter"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                >
                    <option value="">Toutes les catégories</option>
                    {categories.map((c) => (
                        <option key={c} value={c}>
                            {c}
                        </option>
                    ))}
                </select>
            </div>

            {/*  Affichage erreurs */}
            {error && <p className="client-services__error">{error}</p>}

            {loading ? (
                <p>Chargement…</p>
            ) : (
                <div className="client-services__grid">
                    {services.map((s) => (
                        <article
                            key={s._id}
                            className="service-card"
                            onClick={() => handleOpenDetails(s)}
                            role="button"
                            tabIndex={0}
                        >
                            <div className="service-card__img">
                                {s.imageUrl ? (
                                    <img src={s.imageUrl} alt={s.name} />
                                ) : (
                                    <div className="service-card__img--placeholder">Photo</div>
                                )}
                            </div>

                            <div className="service-card__body">
                                <h3 className="service-card__title">{s.name}</h3>
                                <p className="service-card__category">{s.category}</p>
                            </div>
                        </article>
                    ))}

                    {services.length === 0 && (
                        <p style={{ gridColumn: "1 / -1" }}>
                            Aucun service dans cette catégorie.
                        </p>
                    )}
                </div>
            )}

            {/* MODAL DÉTAILS */}
            <ServiceDetailsModal
                open={openDetails}
                service={selectedService}
                onClose={() => setOpenDetails(false)}
                onBook={handleOpenBooking}
            />

            {/*  MODAL CALENDRIER */}
            <BookingModal
                open={openBooking}
                service={selectedService}
                onClose={() => setOpenBooking(false)}
                onConfirm={handleConfirmBooking}
            />

            {/*   bloquer les clics pendant l’envoi */}
            {bookingSubmitting && (
                <div className="client-services__loadingOverlay">
                    <div className="client-services__spinner">Réservation…</div>
                </div>
            )}

            {/*  TOAST */}
            {toast && (
                <div className="client-toast">
                    {toast}
                </div>
            )}

        </div>
    );
};

export default Services;
