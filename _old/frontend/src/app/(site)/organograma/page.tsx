
"use client";

import { PageTitle } from "@/components/site/common";
import { useTranslation } from 'react-i18next';
import Image from 'next/image';

export default function Educacao() {
    const { t } = useTranslation("school");

    return (
        <>
            <PageTitle title={t("organizationalChart.title")} subtitle={t("organizationalChart.subtitle")} />
            <section className="organizational-chart__area pt-120 pb-90">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-12">
                            <div className="organizational-chart">
                                <Image
                                    src="/assets/img/about/organization.png"
                                    alt={t("organizationalChart.alt_text", "Organograma")}
                                    width={1200}
                                    height={800}
                                    className="img-fluid"
                                    priority
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
