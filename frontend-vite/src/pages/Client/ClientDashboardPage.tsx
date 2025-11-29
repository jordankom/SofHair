// FRONTEND
// ─────────────────────────────────────────────────────────
// Page client /client
// Affiche :
// - "Votre prochain rendez-vous est le ..." si un RDV existe
// - "Aucun rendez-vous planifié" sinon
// Actuellement : données simulées (mock)
// Plus tard : sera remplacé par un appel API BACKEND
// ─────────────────────────────────────────────────────────

import React from 'react';
import Card from '../../components/ui/Card';
import AuthLayout from '../../components/layout/AuthLayout';
import { useAuth } from '../../context/AuthContext.tsx';

interface Appointment {
    date: string;
    service: string;
    salon: string;
}

// Fonction mock (pour l'instant)
// Plus tard : sera remplacée par un appel API → BACKEND
function useNextAppointment(): Appointment | null {
    const simulateAppointment = true; // ← METS false pour tester

    if (!simulateAppointment) return null;

    return {
        date: "14 janvier 2026 à 10h30",
        service: "Shampoing + Coupe + Soin",
        salon: "SoftHair Studio – Centre-ville",
    };
}

const ClientDashboardPage: React.FC = () => {
    const { user } = useAuth();
    const appointment = useNextAppointment();

    return (
        <AuthLayout>
            <div className="client-dashboard">

            <h1>Bienvenue {user?.email || ""} 👋</h1>

    <Card>
    <h2>Votre prochain rendez-vous</h2>

    {appointment ? (
        <>
            <p><strong>Date :</strong> {appointment.date}</p>
    <p><strong>Prestation :</strong> {appointment.service}</p>
    <p><strong>Salon :</strong> {appointment.salon}</p>
    </>
    ) : (
        <p>Aucun rendez-vous planifié pour le moment.</p>
    )}
    </Card>

    </div>
    </AuthLayout>
);
};

export default ClientDashboardPage;
