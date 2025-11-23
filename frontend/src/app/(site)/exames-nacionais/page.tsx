
"use client";

import { PageTitle } from "@/components/site/common";
import { useTranslation } from 'react-i18next';

export default function ExamesNacionais() {
    const { t } = useTranslation("secretary");

    return (
        <>
            <PageTitle title={t("examesNacionais.title")} subtitle={t("examesNacionais.subtitle")} />
            <section className="exames-nacionais__area pt-120 pb-90">
            </section>
        </>
    );
}