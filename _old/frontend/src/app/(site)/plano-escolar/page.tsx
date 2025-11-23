
"use client";

import { PageTitle } from "@/components/site/common";
import { useTranslation } from 'react-i18next';
import Image from 'next/image';

export default function Educacao() {
    const { t } = useTranslation("secretary");

    return (
        <>
            <PageTitle title={t("schoolPlan.title")} subtitle={t("schoolPlan.subtitle")} />
            <section className="school-plan__area pt-120 pb-90">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-12">
                            <div className="school-plan">
                                {/* <Image
                                    src="/images/school-plan.png"
                                    alt={t("schoolPlan.alt_text", "Plano Escolar")}
                                    width={1200}
                                    height={800}
                                    className="img-fluid"
                                    priority
                                /> */}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
