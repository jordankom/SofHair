// FRONTEND
// Page Prestations (propriétaire)
// - Récupère les prestations en BD (backend)
// - Affiche 100+ cartes
// - Filtre par catégorie

import React, { useEffect, useMemo, useState } from 'react';
import OwnerSidebar from '../../components/layout/OwnerSidebar';
import '../../styles/pages/_ownerServices.scss';
import { fetchServices, type Service } from '../../services/servicesApi';

const OwnerServicesPage: React.FC = () => {
    // Liste complète des prestations (depuis la BD)
    const [services, setServices] = useState<Service[]>([]);
    // Catégorie sélectionnée
    const [selectedCategory, setSelectedCategory] = useState<string>('Toutes');
    // États de chargement / erreur
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Au montage du composant → appel API
    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await fetchServices(); // on récupère tout
                setServices(data);
            } catch (e) {
                console.error('Erreur fetchServices :', e);
                setError('Erreur lors du chargement des prestations.');
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    // Liste des catégories disponibles (calculée depuis les données)
    const categories = useMemo(
        () => Array.from(new Set(services.map((s) => s.category))),
        [services]
    );

    // Services filtrés par catégorie
    const filteredServices = useMemo(() => {
        if (selectedCategory === 'Toutes') return services;
        return services.filter((s) => s.category === selectedCategory);
    }, [services, selectedCategory]);

    // Suppression (pour l’instant uniquement côté front, visuel)
    const handleDelete = (id: string) => {
        const confirmDelete = window.confirm('Supprimer cette prestation ?');
        if (!confirmDelete) return;

        setServices((prev) => prev.filter((service) => service._id !== id));
        // PLUS TARD : appeler DELETE /api/services/:id coté backend
    };

    return (
        <div className="owner-layout">
            <OwnerSidebar />

            <main className="owner-layout__main owner-services">
                {/* HEADER */}
                <header className="owner-services__header">
                    <div>
                        <h1>Prestations du salon</h1>
                        <p>Gérez les services proposés à vos clients.</p>
                    </div>

                    <div className="owner-services__controls">
                        {/* Select catégorie */}
                        <select
                            className="owner-services__select"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option value="Toutes">Toutes les catégories</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>

                        {/* Bouton ajouter (on fera le formulaire plus tard) */}
                        <button className="owner-services__add-btn">
                            + Ajouter une prestation
                        </button>
                    </div>
                </header>

                {/* ÉTAT CHARGEMENT / ERREUR */}
                {loading && <p>Chargement des prestations...</p>}
                {error && <p className="owner-services__error">{error}</p>}

                {/* GRILLE DES CARTES */}
                {!loading && !error && (
                    <section className="owner-services__grid">
                        {filteredServices.map((service) => (
                            <article key={service._id} className="owner-services__card">
                                {/* Image */}
                                <div className="owner-services__image-wrapper">
                                    <img src={service.imageUrl} alt={service.name} />
                                </div>

                                {/* Infos */}
                                <div className="owner-services__info">
                                    <h2>{service.name}</h2>
                                    <span className="owner-services__category">
                    {service.category}
                  </span>
                                    <p className="owner-services__meta">
                                        {service.durationMinutes} min • {service.price} €
                                    </p>
                                </div>

                                {/* Actions (visuel) */}
                                <div className="owner-services__actions">
                                    <button className="edit-btn">Modifier</button>
                                    <button
                                        className="delete-btn"
                                        onClick={() => handleDelete(service._id)}
                                    >
                                        Supprimer
                                    </button>
                                </div>
                            </article>
                        ))}

                        {filteredServices.length === 0 && (
                            <p className="owner-services__empty">
                                Aucune prestation dans cette catégorie pour le moment.
                            </p>
                        )}
                    </section>
                )}
            </main>
        </div>
    );
};

export default OwnerServicesPage;
