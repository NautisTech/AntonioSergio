
"use client";

import { Gallery, SlidingGallery, PageTitle } from "@/components/site/common";
import { useTranslation } from 'react-i18next';

export default function Instalacoes() {
    const { t } = useTranslation("school");

    const facilityImages = {
        classrooms: [
            {
                src: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?auto=format&fit=crop&w=800&q=80",    
                title: t("facilities.images.classrooms.0.title"),
                category: t("facilities.images.classrooms.0.category")
            },
            {
                src: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80",
                title: t("facilities.images.classrooms.1.title"),
                category: t("facilities.images.classrooms.1.category")
            },
            {
                src: "assets/img/breadcrumb/entry.jpg",
                title: t("facilities.images.classrooms.2.title"),
                category: t("facilities.images.classrooms.2.category")
            }
        ],
        labs: [
            {
                src: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80",
                title: t("facilities.images.labs.0.title"),
                category: t("facilities.images.labs.0.category")
            },
            {
                src: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?auto=format&fit=crop&w=800&q=80",
                title: t("facilities.images.labs.1.title"),
                category: t("facilities.images.labs.1.category")
            },
            {
                src: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?auto=format&fit=crop&w=800&q=80",
                title: t("facilities.images.labs.2.title"),
                category: t("facilities.images.labs.2.category")
            }
        ],
        workshops: [
            {
                src: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=800&q=80",
                title: t("facilities.images.workshops.0.title"),
                category: t("facilities.images.workshops.0.category")
            },
            {
                src: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&w=800&q=80",
                title: t("facilities.images.workshops.1.title"),
                category: t("facilities.images.workshops.1.category")
            },
            {
                src: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?auto=format&fit=crop&w=800&q=80",
                title: t("facilities.images.workshops.2.title"),
                category: t("facilities.images.workshops.2.category")
            }
        ],
        playground: [
            {
                src: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
                title: t("facilities.images.playground.0.title"),
                category: t("facilities.images.playground.0.category")
            },
            {
                src: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80",
                title: t("facilities.images.playground.1.title"),
                category: t("facilities.images.playground.1.category")
            },
            {
                src: "https://images.unsplash.com/photo-1593766827228-8737b4534aa6?auto=format&fit=crop&w=800&q=80",
                title: t("facilities.images.playground.2.title"),
                category: t("facilities.images.playground.2.category")
            }
        ],
        library: [
            {
                src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
                title: t("facilities.images.library.0.title"),
                category: t("facilities.images.library.0.category")
            },
            {
                src: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&q=80",
                title: t("facilities.images.library.1.title"),
                category: t("facilities.images.library.1.category")
            },
            {
                src: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80",
                title: t("facilities.images.library.2.title"),
                category: t("facilities.images.library.2.category")
            }
        ],
        common: [
            {
                src: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
                title: t("facilities.images.common.0.title"),
                category: t("facilities.images.common.0.category")
            },
            {
                src: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80",
                title: t("facilities.images.common.1.title"),
                category: t("facilities.images.common.1.category")
            },
            {
                src: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=800&q=80",
                title: t("facilities.images.common.2.title"),
                category: t("facilities.images.common.2.category")
            }
        ]
    };

    return (
        <>
            <PageTitle title={t("facilities.title")} subtitle={t("facilities.subtitle")} />
            {/* Classrooms Section */}
            <section className="facility__section pt-115 pb-60">
                <div className="container">
                    <div className="row">
                        <div className="col-xxl-12">
                            <div className="section__title-wrapper text-center mb-60">
                                <span className="section__title-pre">{t("facilities.categories.classrooms.title")}</span>
                                <h2 className="section__title section__title-44">
                                    {t("facilities.categories.classrooms.title")}
                                </h2>
                                <p>{t("facilities.categories.classrooms.description")}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <SlidingGallery images={facilityImages.classrooms} />
            </section>

            {/* Laboratories Section */}
            <section className="facility__section pt-60 pb-60 grey-bg-3">
                <div className="container">
                    <div className="row">
                        <div className="col-xxl-12">
                            <div className="section__title-wrapper text-center mb-60">
                                <span className="section__title-pre">{t("facilities.categories.labs.title")}</span>
                                <h2 className="section__title section__title-44">
                                    {t("facilities.categories.labs.title")}
                                </h2>
                                <p>{t("facilities.categories.labs.description")}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <SlidingGallery images={facilityImages.labs} />
            </section>

            {/* Workshops Section */}
            <section className="facility__section pt-60 pb-60">
                <div className="container">
                    <div className="row">
                        <div className="col-xxl-12">
                            <div className="section__title-wrapper text-center mb-60">
                                <span className="section__title-pre">{t("facilities.categories.workshops.title")}</span>
                                <h2 className="section__title section__title-44">
                                    {t("facilities.categories.workshops.title")}
                                </h2>
                                <p>{t("facilities.categories.workshops.description")}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <SlidingGallery images={facilityImages.workshops} />
            </section>

            {/* Playground & Sports Section */}
            <section className="facility__section pt-60 pb-60 grey-bg-3">
                <div className="container">
                    <div className="row">
                        <div className="col-xxl-12">
                            <div className="section__title-wrapper text-center mb-60">
                                <span className="section__title-pre">{t("facilities.categories.playground.title")}</span>
                                <h2 className="section__title section__title-44">
                                    {t("facilities.categories.playground.title")}
                                </h2>
                                <p>{t("facilities.categories.playground.description")}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <SlidingGallery images={facilityImages.playground} />
            </section>

            {/* Library Section */}
            <section className="facility__section pt-60 pb-60">
                <div className="container">
                    <div className="row">
                        <div className="col-xxl-12">
                            <div className="section__title-wrapper text-center mb-60">
                                <span className="section__title-pre">{t("facilities.categories.library.title")}</span>
                                <h2 className="section__title section__title-44">
                                    {t("facilities.categories.library.title")}
                                </h2>
                                <p>{t("facilities.categories.library.description")}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <SlidingGallery images={facilityImages.library} />
            </section>

            {/* Common Areas Section */}
            <section className="facility__section pt-60 pb-90 grey-bg-3">
                <div className="container">
                    <div className="row">
                        <div className="col-xxl-12">
                            <div className="section__title-wrapper text-center mb-60">
                                <span className="section__title-pre">{t("facilities.categories.common.title")}</span>
                                <h2 className="section__title section__title-44">
                                    {t("facilities.categories.common.title")}
                                </h2>
                                <p>{t("facilities.categories.common.description")}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <SlidingGallery images={facilityImages.common} />
            </section>
        </>
    );
}
