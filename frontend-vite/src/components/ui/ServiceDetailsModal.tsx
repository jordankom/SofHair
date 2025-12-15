// FRONTEND
// Modal qui affiche en grand le détail d'une prestation + bouton "Prendre RDV"

import React from "react";
import "../../styles/components/_clientModals.scss";
import type { ServiceItem } from "../../services/services.service";

type Props = {
    open: boolean; // true => modal visible
    service: ServiceItem | null; // prestation sélectionnée
    onClose: () => void; // fermer
    onBook: (service: ServiceItem) => void; // ouvrir le calendrier
};

const ServiceDetailsModal: React.FC<Props> = ({ open, service, onClose, onBook }) => {
    // Si pas ouvert ou pas de service => on ne rend rien
    if (!open || !service) return null;

    return (
        // Backdrop : clique dehors => ferme
        <div className="client-modal__backdrop" onClick={onClose}>
            {/* stopPropagation : clique dans la boîte => ne ferme pas */}
            <div className="client-modal" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="client-modal__header">
                    <h2>Détails de la prestation</h2>
                    <button className="client-modal__close" onClick={onClose} aria-label="Fermer">
                        ✕
                    </button>
                </div>

                {/* Contenu */}
                <div className="client-modal__content">
                    {/* Image en haut */}
                    <div className="client-modal__image">
                        {service.imageUrl ? (
                            <img src={service.imageUrl} alt={service.name} />
                        ) : (
                            <div className="client-modal__image--placeholder">Photo</div>
                        )}
                    </div>

                    {/* Infos */}
                    <div className="client-modal__info">
                        <h3 className="client-modal__title">{service.name}</h3>

                        {/* Badges / meta */}
                        <div className="client-modal__meta">
                            <span className="client-pill">{service.category}</span>

                            {/* Afficher si dispo */}
                            {typeof service.price === "number" && (
                                <span className="client-pill client-pill--soft">{service.price} €</span>
                            )}
                            {(service as any).durationMinutes && (
                                <span className="client-pill client-pill--soft">
                  {(service as any).durationMinutes} min
                </span>
                            )}
                        </div>

                        {/* Description */}
                        <p className="client-modal__desc">
                            {service.description?.trim()
                                ? service.description
                                : "Aucune description pour le moment. Vous pourrez la consulter bientôt."}
                        </p>

                        {/* CTA */}
                        <div className="client-modal__actions">
                            <button className="client-btn client-btn--ghost" onClick={onClose}>
                                Retour
                            </button>

                            <button className="client-btn client-btn--primary" onClick={() => onBook(service)}>
                                Prendre RDV
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceDetailsModal;
