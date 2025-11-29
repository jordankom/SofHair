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
                        <div>Dashboard propriétaire (à faire)</div>
                    </RequireAuth>
                }
            />

            <Route path="/register" element={<RegisterPage />} />


        </Routes>
    );
};

export default App;
