import React, { useEffect, useMemo, useState } from "react";
import OwnerSidebar from "../../components/layout/OwnerSidebar";
import "../../styles/pages/_ownerServices.scss";

import {
    fetchServices,
    createService,
    updateService,
    deleteService,
    type Service,
    type CreateServicePayload,
} from "../../services/servicesApi";

import OwnerServiceFormModal from "../../components/ui/OwnerServiceFormModal";

const OwnerServicesPage: React.FC = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>("Toutes");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    //  modal create/edit
    const [openForm, setOpenForm] = useState(false);
    const [editTarget, setEditTarget] = useState<Service | null>(null);

    // confirmation delete
    const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

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

    const categories = useMemo(() => Array.from(new Set(services.map((s) => s.category))), [services]);

    const filteredServices = useMemo(() => {
        if (selectedCategory === "Toutes") return services;
        return services.filter((s) => s.category === selectedCategory);
    }, [services, selectedCategory]);

    //  open create
    const openCreate = () => {
        setEditTarget(null);
        setOpenForm(true);
    };

    //  open edit
    const openEdit = (s: Service) => {
        setEditTarget(s);
        setOpenForm(true);
    };

    //  submit create or update
    const handleSubmit = async (payload: CreateServicePayload) => {
        if (editTarget?._id) {
            await updateService(editTarget._id, payload);
        } else {
            await createService(payload);
        }
        await loadServices();
    };

    //  delete confirm
    const askDelete = (s: Service) => {
        setDeleteError(null);
        setDeleteTarget(s);
    };

    const confirmDelete = async () => {
        if (!deleteTarget?._id) return;

        try {
            setDeleteLoading(true);
            setDeleteError(null);

            console.log("[DELETE] sending:", deleteTarget._id);
            await deleteService(deleteTarget._id);
            console.log("[DELETE] success");

            setDeleteTarget(null);
            await loadServices();
        } catch (e: any) {
            console.error("[DELETE] error:", e);
            setDeleteError(e?.response?.data?.message || e?.message || "Erreur lors de la suppression.");
        } finally {
            setDeleteLoading(false);
        }
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

                        <button className="owner-services__add-btn" onClick={openCreate}>
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
                                    {service.imageUrl ? (
                                        <img src={service.imageUrl} alt={service.name} />
                                    ) : (
                                        <div className="owner-services__image-fallback">Image</div>
                                    )}
                                </div>

                                <div className="owner-services__info">
                                    <h2>{service.name}</h2>
                                    <span className="owner-services__category">{service.category}</span>
                                    <p className="owner-services__meta">
                                        {service.durationMinutes} min • {service.price} €
                                    </p>
                                </div>

                                <div className="owner-services__actions">
                                    <button className="edit-btn" onClick={() => openEdit(service)}>
                                        Modifier
                                    </button>
                                    <button className="delete-btn" onClick={() => askDelete(service)}>
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

                {/*  Modal create/edit */}
                <OwnerServiceFormModal
                    open={openForm}
                    onClose={() => setOpenForm(false)}
                    onSubmit={handleSubmit}
                    initialService={editTarget}
                />

                {/*  Modal confirmation delete (moderne) */}
                {deleteTarget && (
                    <div className="owner-confirm__backdrop" onClick={() => setDeleteTarget(null)}>
                        <div className="owner-confirm" onClick={(e) => e.stopPropagation()}>
                            <div className="owner-confirm__header">
                                <h3>Supprimer la prestation ?</h3>
                                <button className="owner-confirm__close" onClick={() => setDeleteTarget(null)} aria-label="Fermer">
                                    ✕
                                </button>
                            </div>

                            <p className="owner-confirm__text">
                                Vous êtes sur le point de supprimer <strong>{deleteTarget.name}</strong>. Cette action est irréversible.
                            </p>

                            {deleteError && <p className="owner-confirm__error">{deleteError}</p>}

                            <div className="owner-confirm__actions">
                                <button className="owner-confirm__btn owner-confirm__btn--ghost" onClick={() => setDeleteTarget(null)} disabled={deleteLoading}>
                                    Annuler
                                </button>
                                <button className="owner-confirm__btn owner-confirm__btn--danger" onClick={confirmDelete} disabled={deleteLoading}>
                                    {deleteLoading ? "Suppression..." : "Supprimer"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default OwnerServicesPage;
