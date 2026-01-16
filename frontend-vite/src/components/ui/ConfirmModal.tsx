import React from "react";
import "../../styles/components/_clientModals.scss";

/**
 * Modal de confirmation générique
 * - open : affiche / cache
 * - title / message : textes
 * - confirmLabel / cancelLabel : libellés des boutons
 * - onConfirm / onClose : actions
 * - loading : désactive les boutons pendant une action async
 */
type ConfirmModalProps = {
    open: boolean;
    title?: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    loading?: boolean;
    onClose: () => void;
    onConfirm: () => void;
};

const ConfirmModal: React.FC<ConfirmModalProps> = ({
                                                       open,
                                                       title = "Confirmer",
                                                       message,
                                                       confirmLabel = "Confirmer",
                                                       cancelLabel = "Annuler",
                                                       loading = false,
                                                       onClose,
                                                       onConfirm,
                                                   }) => {
    // ⚠️ Important : return après les props (pas de hooks ici, donc safe)
    if (!open) return null;

    return (
        // Backdrop : clic dehors => ferme
        <div className="client-modal__backdrop" onClick={onClose}>
            {/* stopPropagation => clic dans la boite ne ferme pas */}
            <div className="client-modal" onClick={(e) => e.stopPropagation()}>
                <div className="client-modal__header">
                    <h2>{title}</h2>
                    <button className="client-modal__close" onClick={onClose} aria-label="Fermer">
                        ✕
                    </button>
                </div>

                <div className="client-modal__content">
                    <p style={{ margin: 0 }}>{message}</p>

                    <div className="client-modal__actions">
                        <button className="client-btn client-btn--ghost" onClick={onClose} disabled={loading}>
                            {cancelLabel}
                        </button>

                        <button
                            className="client-btn client-btn--primary"
                            onClick={onConfirm}
                            disabled={loading}
                            title={loading ? "Veuillez patienter…" : "Confirmer"}
                        >
                            {loading ? "Traitement…" : confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
