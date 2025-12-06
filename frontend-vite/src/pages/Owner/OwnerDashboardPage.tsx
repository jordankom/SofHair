// Page de base du dashboard propriétaire.
import React from 'react';
import OwnerSidebar from '../../components/layout/OwnerSidebar';

const OwnerDashboardPage: React.FC = () => {
    return (
        <div className="owner-layout">
            <OwnerSidebar />

            <main className="owner-layout__main">
                <header className="owner-layout__header">
                    <h1>Calendrier du salon</h1>
                    <p>Vue d’ensemble de vos rendez-vous, services et équipes.</p>
                </header>

                <section className="owner-layout__content">
                    <p>Contenu calendrier à venir… (prochaine étape)</p>
                </section>
            </main>
        </div>
    );
};

export default OwnerDashboardPage;
