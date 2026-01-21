import React from "react";
import { Routes, Route } from "react-router-dom";

import LandingPage from "./pages/Auth/LandingPage";
import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";

import RequireAuth from "./components/routing/RequireAuth";

import ClientDashboardPage from "./pages/Client/ClientDashboardPage";
import Services from "./pages/Client/Services";
import Gallery from "./pages/Client/Gallery";

import RdvNew from "./pages/Client/RdvNew";
import Rdvs from "./pages/Client/Rdvs";
import ClientSettingsPage from "./pages/Client/Settings";

import OwnerDashboardPage from "./pages/Owner/OwnerDashboardPage";
import OwnerAppointmentsPage from "./pages/Owner/OwnerAppointmentsPage";
import OwnerServicesPage from "./pages/Owner/OwnerServicesPage";
import OwnerStatsPage from "./pages/Owner/OwnerStatsPage";
import OwnerClientsPage from "./pages/Owner/OwnerClientsPage";
import OwnerTeamPage from "./pages/Owner/OwnerTeamPage.tsx";
import OwnerPromotionsPage from "./pages/Owner/OwnerPromotionsPage";
import OwnerStaffPlanningPage from "./pages/Owner/OwnerStaffPlanningPage.tsx";

const App: React.FC = () => {
    return (
        <Routes>
            {/* ===================== */}
            {/* Routes publiques */}
            {/* ===================== */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* ===================== */}
            {/* Espace client (protégé) */}
            {/* ===================== */}
            <Route
                path="/client"
                element={
                    <RequireAuth allowedRoles={["client"]}>
                        <ClientDashboardPage />
                    </RequireAuth>
                }
            />

            {/*  On protège aussi toutes les routes enfant du client */}
            <Route
                path="/client/rdv/new"
                element={
                    <RequireAuth allowedRoles={["client"]}>
                        <RdvNew />
                    </RequireAuth>
                }
            />

            <Route
                path="/client/rdv"
                element={
                    <RequireAuth allowedRoles={["client"]}>
                        <Rdvs />
                    </RequireAuth>
                }
            />

            <Route
                path="/client/services"
                element={
                    <RequireAuth allowedRoles={["client"]}>
                        <Services />
                    </RequireAuth>
                }
            />

            <Route
                path="/client/gallery"
                element={
                    <RequireAuth allowedRoles={["client"]}>
                        <Gallery />
                    </RequireAuth>
                }
            />

            <Route
                path="/client/settings"
                element={
                    <RequireAuth allowedRoles={["client"]}>
                        <ClientSettingsPage />
                    </RequireAuth>
                }
            />

            {/* ===================== */}
            {/* Espace owner (protégé) */}
            {/* ===================== */}
            <Route
                path="/owner"
                element={
                    <RequireAuth allowedRoles={["owner"]}>
                        <OwnerDashboardPage />
                    </RequireAuth>
                }
            />
            <Route
                path="/owner/clients"
                element={
                    <RequireAuth allowedRoles={["owner"]}>
                        <OwnerClientsPage />
                    </RequireAuth>
                }
            />

            <Route
                path="/owner/team"
                element={
                    <RequireAuth allowedRoles={["owner"]}>
                        <OwnerTeamPage />
                    </RequireAuth>
                }
            />
            <Route
                path="/owner/team/:id/planning"
                element={
                    <RequireAuth allowedRoles={["owner"]}>
                        <OwnerStaffPlanningPage />
                    </RequireAuth>
                }
            />

            <Route
                path="/owner/promotions"
                element={
                    <RequireAuth allowedRoles={["owner"]}>
                        <OwnerPromotionsPage />
                    </RequireAuth>
                }
            />
            <Route
                path="/owner/appointments"
                element={
                    <RequireAuth allowedRoles={["owner"]}>
                        <OwnerAppointmentsPage />
                    </RequireAuth>
                }
            />

            <Route
                path="/owner/prestations"
                element={
                    <RequireAuth allowedRoles={["owner"]}>
                        <OwnerServicesPage />
                    </RequireAuth>
                }
            />

            <Route
                path="/owner/stats"
                element={
                    <RequireAuth allowedRoles={["owner"]}>
                        <OwnerStatsPage />
                    </RequireAuth>
                }
            />
        </Routes>
    );
};

export default App;
