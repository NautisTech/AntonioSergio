
"use client";

import { PageTitle } from "@/components/site/common";
import { useTranslation } from 'react-i18next';

export default function Educacao() {
    const { t } = useTranslation("school");

    const educationLevels = [
        {
            id: "jardim-infancia",
            title: t("education.levels.kindergarten.title"),
            subtitle: t("education.levels.kindergarten.subtitle"),
            description: t("education.levels.kindergarten.description"),
            image: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?auto=format&fit=crop&w=800&q=80",
            reverse: false
        },
        {
            id: "primario",
            title: t("education.levels.primary.title"),
            subtitle: t("education.levels.primary.subtitle"),
            description: t("education.levels.primary.description"),
            image: "https://images.unsplash.com/photo-1497486751825-1233686d5d80?auto=format&fit=crop&w=800&q=80",
            reverse: true
        },
        {
            id: "basico",
            title: t("education.levels.middle.title"),
            subtitle: t("education.levels.middle.subtitle"),
            description: t("education.levels.middle.description"),
            image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80",
            reverse: false
        },
        {
            id: "secundario",
            title: t("education.levels.high.title"),
            subtitle: t("education.levels.high.subtitle"),
            description: t("education.levels.high.description"),
            image: "/assets/img/campus/campus-3.jpg",
            reverse: true
        }
    ];

    return (
        <>
            <PageTitle title={t("education.title")} subtitle={t("education.subtitle")} />

            {educationLevels.map((level, index) => (
                <section
                    key={level.id}
                    id={level.id}
                    className={`education__section pt-115 pb-115 ${index % 2 === 1 ? 'grey-bg-3' : ''}`}
                >
                    <div className="container">
                        <div className="row align-items-center">
                            <div className={`col-xxl-6 col-xl-6 col-lg-6 ${level.reverse ? 'order-lg-2' : ''}`}>
                                <div className={`education__content ${level.reverse ? 'pl-30' : 'pr-30'}`}>
                                    <div className="section__title-wrapper mb-40">
                                        <span className="section__title-pre">{level.subtitle}</span>
                                        <h2 className="section__title section__title-44">
                                            {level.title}
                                        </h2>
                                    </div>
                                    <p className="education__description">
                                        {level.description}
                                    </p>
                                </div>
                            </div>

                            <div className={`col-xxl-6 col-xl-6 col-lg-6 ${level.reverse ? 'order-lg-1' : ''}`}>
                                <div className={`education__image ${level.reverse ? 'pr-30' : 'pl-30'}`}>
                                    <img
                                        src={level.image}
                                        alt={level.title}
                                        style={{
                                            width: '100%',
                                            height: '400px',
                                            objectFit: 'cover',
                                            borderRadius: '12px',
                                            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            ))}
        </>
    );
}
