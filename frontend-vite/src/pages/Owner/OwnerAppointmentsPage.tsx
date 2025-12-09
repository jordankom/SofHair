// FRONTEND
// Page Rendez-vous (propriétaire)
// Objectif : afficher une vue "jour" simple et claire,
// avec des cartes pour chaque rendez-vous sur la partie droite.

import React from 'react';
import OwnerSidebar from '../../components/layout/OwnerSidebar';

// On importe les styles spécifiques à cette page
import '../../styles/pages/_ownerAppointments.scss';

// Type représentant un rendez-vous (pour l'instant : données mock)
interface Appointment {
    id: string;
    time: string;       // ex: "09:00 - 10:00"
    client: string;     // nom du client
    service: string;    // nom de la prestation
    stylist: string;    // coiffeur
}

const mockAppointments: Appointment[] = [
    {
        id: '1',
        time: '09:00 - 10:00',
        client: 'Camille Dupont',
        service: 'Coupe & brushing',
        stylist: 'Emma',
    },
    {
        id: '2',
        time: '10:30 - 11:30',
        client: 'Arthur Martin',
        service: 'Dégradé + barbe',
        stylist: 'Thomas',
    },
    {
        id: '3',
        time: '14:00 - 15:30',
        client: 'Lina Moreau',
        service: 'Balayage & soin profond',
        stylist: 'Juliette',
    },
];

const OwnerAppointmentsPage: React.FC = () => {
    return (
        <div className="owner-layout">
            {/* Barre latérale à gauche (menu propriétaire) */}
            <OwnerSidebar />

            {/* Partie droite : contenu de la page */}
            <main className="owner-layout__main owner-appointments">
                {/* HEADER */}
                <header className="owner-appointments__header">
                    <div>
                        <h1>Rendez-vous du jour</h1>
                        <p>
                            Consultez les rendez-vous planifiés pour aujourd&apos;hui au salon.
                        </p>
                    </div>

                    {/* Pour plus tard : filtres / date / bouton ajouter */}
                    <div className="owner-appointments__header-actions">
                        <input
                            type="date"
                            className="owner-appointments__date-input"
                        />
                        <button className="owner-appointments__add-btn">
                            + Nouveau rendez-vous
                        </button>
                    </div>
                </header>

                {/* CONTENU PRINCIPAL */}
                <section className="owner-appointments__content">
                    {/* Colonne gauche : timeline des heures */}
                    <div className="owner-appointments__time-column">
                        {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'].map(
                            (hour) => (
                                <div key={hour} className="owner-appointments__time-slot">
                                    <span>{hour}</span>
                                </div>
                            ),
                        )}
                    </div>

                    {/* Colonne droite : cartes de rendez-vous */}
                    <div className="owner-appointments__cards-column">
                        {mockAppointments.map((rdv) => (
                            <article key={rdv.id} className="owner-appointments__card">
                                <div className="owner-appointments__card-time">
                                    {rdv.time}
                                </div>
                                <div className="owner-appointments__card-main">
                                    <h2 className="owner-appointments__card-service">
                                        {rdv.service}
                                    </h2>
                                    <p className="owner-appointments__card-client">
                                        Client : <strong>{rdv.client}</strong>
                                    </p>
                                    <p className="owner-appointments__card-stylist">
                                        Coiffeur : {rdv.stylist}
                                    </p>
                                </div>
                            </article>
                        ))}

                        {/* Si plus tard il n'y a aucun rendez-vous : */}
                        {/* <p className="owner-appointments__empty">
                            Aucun rendez-vous planifié pour ce jour.
                        </p> */}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default OwnerAppointmentsPage;
