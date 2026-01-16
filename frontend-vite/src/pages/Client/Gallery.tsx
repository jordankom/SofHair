import React, { useMemo, useState } from "react";
import "../../styles/pages/_clientGallery.scss";

// Type pour une image de galerie (mock pour l’instant)
type GalleryItem = {
    id: string;
    title: string;
    category: "Coupe" | "Coloration" | "Soin" | "Homme" | "Enfant";
    imageUrl: string;
};

const Gallery: React.FC = () => {
    /**
     * Données mock (sans backend)
     * - Remplace plus tard par un fetch /api/gallery
     * - Garde la structure : id, title, category, imageUrl
     */
    const items: GalleryItem[] = useMemo(
        () => [
            {
                id: "1",
                title: "Coupe dégradé",
                category: "Coupe",
                imageUrl:
                    "https://images.unsplash.com/photo-1522338140262-f46f5913618a?auto=format&fit=crop&w=1400&q=80",
            },
            {
                id: "2",
                title: "Coloration",
                category: "Coloration",
                imageUrl:
                    "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1400&q=80",
            },
            {
                id: "3",
                title: "Soin & brushing",
                category: "Soin",
                imageUrl:
                    "https://images.unsplash.com/photo-1526045478516-99145907023c?auto=format&fit=crop&w=1400&q=80",
            },
            {
                id: "4",
                title: "Coupe homme",
                category: "Homme",
                imageUrl:
                    "https://images.unsplash.com/photo-1517832606299-7ae9b720a186?auto=format&fit=crop&w=1400&q=80",
            },
            {
                id: "5",
                title: "Enfant",
                category: "Enfant",
                imageUrl:
                    "https://images.unsplash.com/photo-1524253482453-3fed8d2fe12b?auto=format&fit=crop&w=1400&q=80",
            },
            {
                id: "6",
                title: "Avant/Après",
                category: "Coupe",
                imageUrl:
                    "https://images.unsplash.com/photo-1526045612212-70caf35c14df?auto=format&fit=crop&w=1400&q=80",
            },
        ],
        []
    );

    // Catégories disponibles (dérivées des items)
    const categories = useMemo(() => {
        const unique = Array.from(new Set(items.map((i) => i.category)));
        return ["Tous", ...unique] as const;
    }, [items]);

    // Filtre actif
    const [filter, setFilter] = useState<(typeof categories)[number]>("Tous");

    // Image sélectionnée (pour ouvrir le modal)
    const [selected, setSelected] = useState<GalleryItem | null>(null);

    // Liste filtrée
    const filtered = useMemo(() => {
        if (filter === "Tous") return items;
        return items.filter((i) => i.category === filter);
    }, [items, filter]);

    return (
        <div className="client-gallery">
            {/* Header */}
            <div className="client-gallery__header">
                <div>
                    <h1>Galerie</h1>
                    <p>Découvrez quelques réalisations du salon.</p>
                </div>

                {/* Filtre en haut à droite */}
                <select
                    className="client-gallery__filter"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as any)}
                >
                    {categories.map((c) => (
                        <option key={c} value={c}>
                            {c}
                        </option>
                    ))}
                </select>
            </div>

            {/* Grille */}
            <div className="client-gallery__grid">
                {filtered.map((img) => (
                    <button
                        key={img.id}
                        className="gallery-card"
                        onClick={() => setSelected(img)}
                        title="Voir en grand"
                    >
                        <img src={img.imageUrl} alt={img.title} loading="lazy" />
                        <div className="gallery-card__overlay">
                            <div className="gallery-card__title">{img.title}</div>
                            <div className="gallery-card__tag">{img.category}</div>
                        </div>
                    </button>
                ))}

                {filtered.length === 0 && (
                    <div className="client-gallery__empty">Aucune photo pour ce filtre.</div>
                )}
            </div>

            {/* Modal / Lightbox */}
            {selected && (
                <div className="client-modal__backdrop" onClick={() => setSelected(null)}>
                    <div className="client-modal client-modal--wide" onClick={(e) => e.stopPropagation()}>
                        <div className="client-modal__header">
                            <h2>{selected.title}</h2>
                            <button
                                className="client-modal__close"
                                onClick={() => setSelected(null)}
                                aria-label="Fermer"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="client-galleryModal">
                            <div className="client-galleryModal__image">
                                <img src={selected.imageUrl} alt={selected.title} />
                            </div>

                            <div className="client-galleryModal__meta">
                                <span className="client-pill">{selected.category}</span>
                            </div>

                            <div className="client-modal__actions">
                                <button className="client-btn client-btn--ghost" onClick={() => setSelected(null)}>
                                    Fermer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Gallery;
