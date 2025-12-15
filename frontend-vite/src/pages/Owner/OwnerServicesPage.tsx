// FRONTEND
// Page Prestations (owner) + ajout d'une prestation

import React, { useEffect, useMemo, useState } from "react";
import OwnerSidebar from "../../components/layout/OwnerSidebar";
import "../../styles/pages/_ownerServices.scss";

import { fetchServices, createService, type Service, type CreateServicePayload } from "../../services/servicesApi";
import OwnerServiceFormModal from "../../components/ui/OwnerServiceFormModal";

const OwnerServicesPage: React.FC = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>("Toutes");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    //  contrôle modal
    const [openCreate, setOpenCreate] = useState(false);

    //  fonction de refresh (réutilisable après création)
    const loadServices = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchServices();
            setServices(data);
        } catch (e) {
            console.error("Erreur fetchServices :", e);
            setError("Erreur lors du chargement des prestations.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadServices();
    }, []);

    const categories = useMemo(
        () => Array.from(new Set(services.map((s) => s.category))),
        [services]
    );

    const filteredServices = useMemo(() => {
        if (selectedCategory === "Toutes") return services;
        return services.filter((s) => s.category === selectedCategory);
    }, [services, selectedCategory]);

    const handleDelete = (id: string) => {
        const confirmDelete = window.confirm("Supprimer cette prestation ?");
        if (!confirmDelete) return;

        setServices((prev) => prev.filter((service) => service._id !== id));
        // PLUS TARD : DELETE backend
    };

    //  création : on POST puis on refresh
    const handleCreate = async (payload: CreateServicePayload) => {
        await createService(payload);
        await loadServices(); //  recharge la grille immédiatement
    };

    return (
        <div className="owner-layout">
            <OwnerSidebar />

            <main className="owner-layout__main owner-services">
                <header className="owner-services__header">
                    <div>
                        <h1>Prestations du salon</h1>
                        <p>Gérez les services proposés à vos clients.</p>
                    </div>

                    <div className="owner-services__controls">
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

                        <button
                            className="owner-services__add-btn"
                            onClick={() => setOpenCreate(true)}
                        >
                            + Ajouter une prestation
                        </button>
                    </div>
                </header>

                {loading && <p>Chargement des prestations...</p>}
                {error && <p className="owner-services__error">{error}</p>}

                {!loading && !error && (
                    <section className="owner-services__grid">
                        {filteredServices.map((service) => (
                            <article key={service._id} className="owner-services__card">
                                <div className="owner-services__image-wrapper">
                                    <img src={service.imageUrl} alt={service.name} />
                                </div>

                                <div className="owner-services__info">
                                    <h2>{service.name}</h2>
                                    <span className="owner-services__category">{service.category}</span>
                                    <p className="owner-services__meta">
                                        {service.durationMinutes} min • {service.price} €
                                    </p>
                                </div>

                                <div className="owner-services__actions">
                                    <button className="edit-btn">Modifier</button>
                                    <button className="delete-btn" onClick={() => handleDelete(service._id)}>
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

                {/*  Modal création */}
                <OwnerServiceFormModal
                    open={openCreate}
                    onClose={() => setOpenCreate(false)}
                    onSubmit={handleCreate}
                />
            </main>
        </div>
    );
};

export default OwnerServicesPage;
