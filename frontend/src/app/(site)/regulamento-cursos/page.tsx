
"use client";

import { PageTitle } from "@/components/site/common";
import { useTranslation } from 'react-i18next';
import Image from 'next/image';

export default function Educacao() {
    const { t } = useTranslation("secretary");

    return (
        <>
            <PageTitle title={t("professionalCoursesRegulations.title")} subtitle={t("professionalCoursesRegulations.subtitle")} />
            <section className="professional-courses-regulations__area pt-120 pb-90">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-12">
                            <div className="professional-courses-regulations">
                                {/* <Image
                                    src="/images/professional-courses-regulations.png"
                                    alt={t("professionalCoursesRegulations.alt_text", "Regulamento dos Cursos Profissionais")}
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
