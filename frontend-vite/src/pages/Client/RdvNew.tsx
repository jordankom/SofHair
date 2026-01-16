import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Page "Prendre un rendez-vous"
 * Idée : on redirige vers /client/services car ton parcours de réservation
 * est déjà complètement prêt là-bas (détails + booking modal + API).
 */
const RdvNew = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // replace=true pour éviter que l'utilisateur revienne sur une page vide avec "retour"
        navigate("/client/services", { replace: true });
    }, [navigate]);

    // On n'affiche rien car on redirige instant
    return null;
};

export default RdvNew;
