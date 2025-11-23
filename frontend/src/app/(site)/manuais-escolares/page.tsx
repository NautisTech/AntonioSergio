
"use client";

import { PageTitle } from "@/components/site/common";
import { useTranslation } from 'react-i18next';

export default function ManuaisEscolares() {
    const { t } = useTranslation("secretary");

    return (
        <>
            <PageTitle title={t("manuaisEscolares.title")} subtitle={t("manuaisEscolares.subtitle")} />
            <section className="manuais-escolares__area pt-120 pb-90">
            </section>
        </>
    );
}