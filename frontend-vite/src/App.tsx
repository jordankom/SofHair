// FRONTEND
// Définition des routes :
// - "/"        → Landing page publique
// - "/login"   → page de connexion
// - "/client"  → réservé au rôle "client"
// - "/owner"   → réservé au rôle "owner"

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/Auth/LandingPage';
import LoginPage from './pages/Auth/LoginPage';
import ClientDashboardPage from './pages/Client/ClientDashboardPage';
import RequireAuth from './components/routing/RequireAuth';
import RegisterPage from './pages/Auth/RegisterPage';
import OwnerDashboardPage from "./pages/Owner/OwnerDashboardPage.tsx";
import OwnerAppointmentsPage from "./pages/Owner/OwnerAppointmentsPage.tsx";
import OwnerServicesPage from "./pages/Owner/OwnerServicesPage.tsx";
import OwnerStatsPage from "./pages/Owner/OwnerStatsPage.tsx";
import RdvNew from "./pages/Client/Rdvs.tsx";
import Rdvs from "./pages/Client/Rdvs.tsx";
import Services from "./pages/Client/Services.tsx";
import Gallery from "./pages/Client/Gallery.tsx";
import {Settings} from "lucide-react";

const App: React.FC = () => {
    return (
        <Routes>
            {/* Page publique */}
            <Route path="/" element={<LandingPage />} />

            {/* Connexion */}
            <Route path="/login" element={<LoginPage />} />

            {/* Espace client (protégé) */}
            <Route
                path="/client"
                element={
                    <RequireAuth allowedRoles={['client']}>
                        <ClientDashboardPage />
                    </RequireAuth>
                }
            />

            {/* Espace propriétaire (admin salon) */}

            <Route
                path="/owner"
                element={
                    <RequireAuth allowedRoles={['owner']}>
                        <OwnerDashboardPage />
                    </RequireAuth>
                }
            />

            <Route path="/register" element={<RegisterPage />} />
            <Route
                path="/owner/appointments"
                element={
                    <RequireAuth allowedRoles={['owner']}>
                        <OwnerAppointmentsPage />
                    </RequireAuth>
                }
            />
            <Route
                path="/owner/prestations"
                element={
                    <RequireAuth allowedRoles={['owner']}>
                        <OwnerServicesPage />
                    </RequireAuth>
                }
            />
            <Route
                path="/owner/stats"
                element={
                    <RequireAuth allowedRoles={['owner']}>
                    <OwnerStatsPage />
                    </RequireAuth>
                }
            />

            <Route path="/client" element={<ClientDashboardPage />} />
            <Route path="/client/rdv/new" element={<RdvNew />} />
            <Route path="/client/rdv" element={<Rdvs />} />
            <Route path="/client/services" element={<Services />} />
            <Route path="/client/gallery" element={<Gallery />} />
            <Route path="/client/settings" element={<Settings />} />
        </Routes>
    );
};

export default App;
