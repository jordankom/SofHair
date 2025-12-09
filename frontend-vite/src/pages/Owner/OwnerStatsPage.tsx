// Page Statistiques du salon (espace propriétaire).
// - Affiche quelques KPI (CA, rendez-vous, annulations, satisfaction)
// - Affiche un mini "graphique" en barres (moyenne de rendez-vous / jour)
// Pour l'instant : données mock, on branchera au backend plus tard.

import React from 'react';
import OwnerSidebar from '../../components/layout/OwnerSidebar';
import '../../styles/pages/_ownerStats.scss';

interface KpiCard {
    label: string;
    value: string;
    badge?: string;
    trend?: 'up' | 'down' | 'neutral';
}

const kpis: KpiCard[] = [
    {
        label: 'Chiffre d’affaires (mois en cours)',
        value: '8 450 €',
        badge: '+12% vs. mois dernier',
        trend: 'up',
    },
    {
        label: 'Rendez-vous réalisés',
        value: '127',
        badge: 'sur 142 réservés',
        trend: 'neutral',
    },
    {
        label: 'Taux d’annulation',
        value: '10,6%',
        badge: '-3 pts vs. mois dernier',
        trend: 'down',
    },
    {
        label: 'Satisfaction moyenne',
        value: '4,7 / 5',
        badge: 'basée sur 89 avis',
        trend: 'up',
    },
];

// Données mock pour un mini graphique "Rdv par jour"
const appointmentsPerDay = [
    { day: 'Lun', value: 18 },
    { day: 'Mar', value: 22 },
    { day: 'Mer', value: 15 },
    { day: 'Jeu', value: 26 },
    { day: 'Ven', value: 32 },
    { day: 'Sam', value: 40 },
    { day: 'Dim', value: 9 },
];

const OwnerStatsPage: React.FC = () => {
    return (
        <div className="owner-layout">
            {/* Barre latérale à gauche */}
            <OwnerSidebar />

            {/* Contenu principal à droite */}
            <main className="owner-layout__main owner-stats">
                {/* HEADER */}
                <header className="owner-stats__header">
                    <div>
                        <h1>Statistiques du salon</h1>
                        <p>Suivez les performances de SoftHair : rendez-vous, revenus, fidélité.</p>
                    </div>
                </header>

                {/* ZONE KPI */}
                <section className="owner-stats__kpis">
                    {kpis.map((kpi) => (
                        <article key={kpi.label} className="owner-stats__kpi-card">
                            <p className="owner-stats__kpi-label">{kpi.label}</p>
                            <p className="owner-stats__kpi-value">{kpi.value}</p>
                            {kpi.badge && (
                                <span
                                    className={`
                    owner-stats__kpi-badge
                    ${kpi.trend === 'up' ? 'owner-stats__kpi-badge--up' : ''}
                    ${kpi.trend === 'down' ? 'owner-stats__kpi-badge--down' : ''}
                  `}
                                >
                  {kpi.badge}
                </span>
                            )}
                        </article>
                    ))}
                </section>

                {/* ZONE "GRAPHIQUE" */}
                <section className="owner-stats__grid">
                    {/* Mini graphique : rendez-vous par jour */}
                    <article className="owner-stats__card owner-stats__card--chart">
                        <div className="owner-stats__card-header">
                            <h2>Rendez-vous par jour</h2>
                            <p>Volume de rendez-vous sur une semaine type.</p>
                        </div>

                        <div className="owner-stats__chart">
                            {appointmentsPerDay.map((item) => (
                                <div key={item.day} className="owner-stats__chart-bar">
                                    <div
                                        className="owner-stats__chart-bar-fill"
                                        style={{ height: `${item.value * 2}%` }} // 2% * valeur (juste visuel)
                                    />
                                    <span className="owner-stats__chart-bar-label">{item.day}</span>
                                </div>
                            ))}
                        </div>
                    </article>

                    {/* Bloc complémentaire : prochaine étape */}
                    <article className="owner-stats__card owner-stats__card--todo">
                        <div className="owner-stats__card-header">
                            <h2>À venir</h2>
                            <p>
                                Cette section affichera des statistiques avancées : prestations les plus
                                réservées, heures de pointe, répartition par coiffeur, etc.
                            </p>
                        </div>

                        <ul className="owner-stats__todo-list">
                            <li>➜ Connecter ces graphiques au backend.</li>
                            <li>➜ Ajouter un filtre par période (jour / semaine / mois).</li>
                            <li>➜ Afficher les prestations les plus rentables.</li>
                        </ul>
                    </article>
                </section>
            </main>
        </div>
    );
};

export default OwnerStatsPage;
