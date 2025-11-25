// LoginPage.tsx (page d'accueil / présentation)
// Structure :
// - Hero plein écran avec image de fond + texte centré
// - Lorsque l'on scrolle, on tombe sur une section à fond blanc
//   avec des blocs de texte correspondant aux onglets de la navbar.

import React from 'react';
import AuthLayout from '../../components/layout/AuthLayout';
import Card from '../../components/ui/Card';

const LoginPage: React.FC = () => {
    return (
        <AuthLayout>
            <div className="landing">
                {/* HERO plein écran avec image en fond */}
                <section className="landing-hero">
                    {/* Overlay pour gérer l'image de fond et l'effet de dégradé */}
                    <div className="landing-hero__background" />

                    {/* Contenu centré dans le hero */}
                    <div className="landing-hero__content">
                        {/* Texte de localisation/sous-titre au-dessus du titre */}
                        <p className="landing-hero__eyebrow">
                            Centre-ville de Vancouver
                        </p>

                        {/* Titre principal affiché en grand, centré */}
                        <h1 className="landing-hero__title">
                            La confiance commence<br />chez SoftHair.
                        </h1>

                        {/* Texte de description sous le titre, toujours centré */}
                        <p className="landing-hero__subtitle">
                            Coupes, couleurs et soins haut de gamme dans un cadre chaleureux.
                            Découvrez nos services, rencontrez notre équipe et préparez votre
                            prochaine visite au salon.
                        </p>
                    </div>
                </section>

                {/* SECTION CONTENU : fond blanc, blocs de texte liés à la navbar */}
                <section className="landing-content">
                    <div className="landing-content__inner">
                        {/* SECTION SERVICES */}
                        <section id="services" className="landing-section">
                            <Card className="landing-section__card">
                                <h2 className="landing-section__title">Nos services</h2>
                                <p className="landing-section__text">
                                    Chez SoftHair Studio, chaque service est imaginé pour sublimer
                                    votre style tout en respectant la nature de vos cheveux.
                                    Coupes, colorations sur mesure, balayages, soins profonds,
                                    lissages, coiffages événementiels&nbsp;: nous construisons avec
                                    vous un parcours adapté à vos besoins.
                                </p>
                                <p className="landing-section__text">
                                    Avant chaque prestation, nous prenons le temps de comprendre
                                    vos attentes, votre routine et votre mode de vie. Notre rôle
                                    est de vous conseiller honnêtement sur ce qui est réaliste,
                                    ce qui vous mettra le plus en valeur et ce qui préservera la
                                    santé de vos cheveux sur le long terme.
                                </p>
                                <p className="landing-section__text">
                                    Dans la future version de l&apos;application, cette section
                                    vous permettra de parcourir le catalogue détaillé, d&apos;afficher
                                    les tarifs et de réserver votre service en quelques clics.
                                </p>
                            </Card>
                        </section>

                        {/* SECTION COIFFEURS */}
                        <section id="coiffeurs" className="landing-section">
                            <Card className="landing-section__card">
                                <h2 className="landing-section__title">Notre équipe de coiffeurs</h2>
                                <p className="landing-section__text">
                                    SoftHair Studio réunit des coiffeurs et coloristes passionnés,
                                    avec des spécialités variées&nbsp;: coupes structurées,
                                    transformations couleur, travail des boucles, cheveux
                                    texturés et looks naturels.
                                </p>
                                <p className="landing-section__text">
                                    Lors de votre visite, votre coiffeur discute avec vous de vos
                                    envies, analyse vos cheveux et vous propose des options
                                    claires. Nous expliquons chaque étape, le temps nécessaire et
                                    l&apos;entretien à prévoir pour que vous sachiez exactement à quoi
                                    vous attendre.
                                </p>
                                <p className="landing-section__text">
                                    À terme, vous pourrez choisir votre coiffeur depuis
                                    l&apos;application, consulter son planning et suivre l&apos;historique
                                    de vos rendez-vous avec lui.
                                </p>
                            </Card>
                        </section>

                        {/* SECTION GALERIE */}
                        <section id="galerie" className="landing-section">
                            <Card className="landing-section__card">
                                <h2 className="landing-section__title">Galerie & inspirations</h2>
                                <p className="landing-section__text">
                                    La galerie présentera des transformations réalisées au salon&nbsp;:
                                    balayages lumineux, coupes courtes affirmées, cheveux bouclés
                                    mis en valeur, looks discrets ou très créatifs.
                                </p>
                                <p className="landing-section__text">
                                    Vous pourrez y enregistrer vos coups de cœur, préparer votre
                                    rendez-vous et montrer vos inspirations directement à votre
                                    coiffeur. Cela nous aidera à visualiser ensemble le résultat
                                    que vous souhaitez.
                                </p>
                                <p className="landing-section__text">
                                    Cette section sera régulièrement mise à jour avec les
                                    tendances du moment, des avant/après et des aperçus de la vie
                                    du salon.
                                </p>
                            </Card>
                        </section>

                        {/* SECTION CONTACT */}
                        <section id="contact" className="landing-section">
                            <Card className="landing-section__card">
                                <h2 className="landing-section__title">Contact & prise de rendez-vous</h2>
                                <p className="landing-section__text">
                                    Vous avez une question avant de réserver&nbsp;? Besoin d&apos;un avis
                                    sur la prestation la plus adaptée ou sur la durée d&apos;un
                                    rendez-vous&nbsp;? L&apos;équipe SoftHair Studio reste disponible pour
                                    vous répondre avec précision.
                                </p>
                                <p className="landing-section__text">
                                    À l&apos;avenir, cette application vous permettra de créer votre
                                    compte, de consulter vos prochains rendez-vous, de modifier un
                                    créneau ou d&apos;annuler une visite directement sans passer par le
                                    téléphone.
                                </p>
                                <p className="landing-section__text">
                                    Pour l&apos;instant, cette partie décrit la manière dont la
                                    communication avec le salon sera simplifiée et centralisée
                                    dans un seul espace.
                                </p>
                            </Card>
                        </section>

                        {/* SECTION LOCALISATION */}
                        <section id="localisation" className="landing-section">
                            <Card className="landing-section__card">
                                <h2 className="landing-section__title">Localisation & ambiance du salon</h2>
                                <p className="landing-section__text">
                                    SoftHair Studio est installé dans une rue calme, à quelques
                                    minutes des principaux transports. Le salon a été conçu comme
                                    un lieu où l&apos;on se sent bien dès l&apos;entrée&nbsp;: lumière douce,
                                    fauteuils confortables, détails soignés.
                                </p>
                                <p className="landing-section__text">
                                    Nous voulons que chaque visite soit une parenthèse de
                                    tranquillité dans votre journée. Vous êtes accueilli·e,
                                    accompagné·e, et nous nous occupons du reste pendant que vous
                                    profitez de ce moment pour vous.
                                </p>
                                <p className="landing-section__text">
                                    Dans les versions suivantes, cette section affichera un plan
                                    interactif, les informations d&apos;accès (parking, transports,
                                    accessibilité) et des conseils pour choisir le meilleur
                                    créneau selon vos contraintes.
                                </p>
                            </Card>
                        </section>
                    </div>
                </section>
            </div>
        </AuthLayout>
    );
};

export default LoginPage;
