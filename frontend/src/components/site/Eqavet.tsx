"use client";

import { useTranslation } from 'react-i18next';
import { SlidingGallery } from '@/components/site/common/SlidingGallery';

export const Eqavet = () => {
    const { t } = useTranslation("school");

    const eqavetImages = [
        {
            src: 'assets/img/eqavet/eqavet-1.png',
            title: t('eqavet.gallery.images.0.title'),
            description: t('eqavet.gallery.images.0.description'),
        },
        {
            src: 'assets/img/eqavet/eqavet-2.png',
            title: t('eqavet.gallery.images.1.title'),
            description: t('eqavet.gallery.images.1.description'),
        },
        {
            src: 'assets/img/eqavet/eqavet-3.png',
            title: t('eqavet.gallery.images.2.title'),
            description: t('eqavet.gallery.images.2.description'),
        },
        {
            src: 'assets/img/eqavet/eqavet-4.png',
            title: t('eqavet.gallery.images.3.title'),
            description: t('eqavet.gallery.images.3.description'),
        },
        {
            src: 'assets/img/eqavet/eqavet-5.png',
            title: t('eqavet.gallery.images.4.title'),
            description: t('eqavet.gallery.images.4.description'),
        },
        {
            src: 'assets/img/eqavet/eqavet-6.png',
            title: t('eqavet.gallery.images.5.title'),
            description: t('eqavet.gallery.images.5.description'),
        },
        {
            src: 'assets/img/eqavet/eqavet-7.png',
            title: t('eqavet.gallery.images.6.title'),
            description: t('eqavet.gallery.images.6.description'),
        },
        {
            src: 'assets/img/eqavet/eqavet-8.png',
            title: t('eqavet.gallery.images.7.title'),
            description: t('eqavet.gallery.images.7.description'),
        },
        {
            src: 'assets/img/eqavet/eqavet-9.jpg',
            title: t('eqavet.gallery.images.8.title'),
            description: t('eqavet.gallery.images.8.description'),
        },
        {
            src: 'assets/img/eqavet/eqavet-10.png',
            title: t('eqavet.gallery.images.9.title'),
            description: t('eqavet.gallery.images.9.description'),
        },
        {
            src: 'assets/img/eqavet/eqavet-11.jpg',
            title: t('eqavet.gallery.images.10.title'),
            description: t('eqavet.gallery.images.10.description'),
        },
        {
            src: 'assets/img/eqavet/eqavet-12.jpg',
            title: t('eqavet.gallery.images.11.title'),
            description: t('eqavet.gallery.images.11.description'),
        },
        {
            src: 'assets/img/eqavet/eqavet-13.png',
            title: t('eqavet.gallery.images.12.title'),
            description: t('eqavet.gallery.images.12.description'),
        }
    ];

    return (
        <>
            <section className="eqavet__section pt-115 pb-60">
                <div className="container">
                    <div className="row">
                        <div className="col-xxl-12">
                            <div className="section__title-wrapper mb-60">
                                <span className="section__title-pre">{t("eqavet.partnerships.companies.title")}</span>
                                <h2 className="section__title section__title-44">
                                    {t("eqavet.partnerships.companies.title")}
                                </h2>
                                <p className="mb-40">{t("eqavet.partnerships.companies.description")}</p>
                            </div>
                            <div className="eqavet__content">
                                <ul className="eqavet__list">
                                    {(t("eqavet.partnerships.companies.items", { returnObjects: true }) as string[]).map((item: string, index: number) => (
                                        <li key={index} className="eqavet__list-item mb-20">
                                            <span className="eqavet__letter">{String.fromCharCode(97 + index)})</span>
                                            <span className="eqavet__text">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="eqavet__section pt-60 pb-60 grey-bg-3">
                <div className="container">
                    <div className="row">
                        <div className="col-xxl-12">
                            <div className="section__title-wrapper mb-60">
                                <span className="section__title-pre">{t("eqavet.partnerships.higher_education.title")}</span>
                                <h2 className="section__title section__title-44">
                                    {t("eqavet.partnerships.higher_education.title")}
                                </h2>
                                <p className="mb-40">{t("eqavet.partnerships.higher_education.description")}</p>
                            </div>
                            <div className="eqavet__content">
                                <ul className="eqavet__list">
                                    {(t("eqavet.partnerships.higher_education.items", { returnObjects: true }) as string[]).map((item: string, index: number) => (
                                        <li key={index} className="eqavet__list-item mb-20">
                                            <span className="eqavet__letter">{String.fromCharCode(97 + index)})</span>
                                            <span className="eqavet__text">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="eqavet__section pt-60 pb-60">
                <div className="container">
                    <div className="row">
                        <div className="col-xxl-12">
                            <div className="section__title-wrapper mb-60">
                                <span className="section__title-pre">{t("eqavet.partnerships.local_administration.title")}</span>
                                <h2 className="section__title section__title-44">
                                    {t("eqavet.partnerships.local_administration.title")}
                                </h2>
                                <p className="mb-40">{t("eqavet.partnerships.local_administration.description")}</p>
                            </div>
                            <div className="eqavet__content">
                                <ul className="eqavet__list">
                                    {(t("eqavet.partnerships.local_administration.items", { returnObjects: true }) as string[]).map((item: string, index: number) => (
                                        <li key={index} className="eqavet__list-item mb-20">
                                            <span className="eqavet__letter">{String.fromCharCode(97 + index)})</span>
                                            <span className="eqavet__text">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="eqavet__gallery pt-60 pb-90 grey-bg-3">
                <div className="container">
                    <div className="row">
                        <div className="col-xxl-12">
                            <div className="section__title-wrapper text-center mb-60">
                                <span className="section__title-pre">EQAVET Partners</span>
                                <h2 className="section__title section__title-44">
                                    Meet our EQAVET Partners
                                </h2>
                                <p>Discover the organizations and institutions we collaborate with to enhance quality assurance in vocational education and training.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <SlidingGallery images={eqavetImages} />
            </section>

            <style jsx>{`
                .eqavet__list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }
                
                .eqavet__list-item {
                    display: flex;
                    align-items: flex-start;
                    margin-bottom: 20px;
                    padding: 15px;
                    background: rgba(255, 255, 255, 0.8);
                    border-radius: 8px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
                    transition: all 0.3s ease;
                }
                
                .eqavet__list-item:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                }
                
                .eqavet__letter {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 30px;
                    height: 30px;
                    background: #dc2626;
                    color: white;
                    border-radius: 50%;
                    font-weight: 600;
                    font-size: 14px;
                    margin-right: 15px;
                    margin-top: 2px;
                }
                
                .eqavet__text {
                    flex: 1;
                    line-height: 1.6;
                    color: #333;
                    font-size: 16px;
                }
                
                .grey-bg-3 .eqavet__list-item {
                    background: rgba(255, 255, 255, 0.9);
                }
            `}</style>
        </>
    );
};